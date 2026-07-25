import { NextResponse } from "next/server";
import { prisma, prismaDirect } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validators";
import { createPayment } from "@/lib/payments";
import { computePrice } from "@/lib/pricing/computePrice";
import { getCurrentUser } from "@/lib/auth";

const RESERVATION_MINUTES = 15;
const PAYMENT_RETRY_ATTEMPTS = 3;
const PAYMENT_RETRY_BASE_DELAY_MS = 500;

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `CMD-${year}-KANKAN-${rand}`;
}

function activeDiscountsFilter(now) {
  return { validFrom: { lte: now }, validTo: { gte: now } };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reserve le stock de facon atomique : verifie ET incremente en une seule
// instruction SQL, pour ne pas laisser de fenetre de course entre la lecture
// du stock disponible et son ecriture.
async function reserveStockAtomic(tx, productId, quantity) {
  const result = await tx.$executeRaw`
    UPDATE "Product"
    SET "reservedStock" = "reservedStock" + ${quantity}
    WHERE id = ${productId} AND stock - "reservedStock" >= ${quantity}
  `;
  return result > 0; // 0 ligne affectee = stock insuffisant au moment exact de l'ecriture
}

// Libere le stock reserve pour une commande qu'on annule suite a un echec
// d'initiation de paiement (apres epuisement des tentatives). Compense la
// reservation faite par reserveStockAtomic + nettoie les StockReservation
// liees a la session, pour ne pas garder du stock bloque 15 minutes pour
// une commande qui ne pourra jamais etre payee.
//
// Transaction interactive -> prismaDirect (le pooler Neon/PgBouncer en mode
// "transaction" ne supporte pas prisma.$transaction(async (tx) => {...}),
// cf. P2028).
async function releaseReservedStock(order, sessionId) {
  await prismaDirect.$transaction(
    async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: { decrement: item.quantity } },
        });
      }
      await tx.stockReservation.deleteMany({ where: { sessionId } });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "ANNULEE" },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  );
}

// Tente l'initiation du paiement avec retry + backoff exponentiel. Le
// provider externe (LengoPay/Djomy) peut avoir des erreurs transitoires
// (timeout, 5xx) qu'un simple retry resout souvent ; on ne distingue pas
// les erreurs "definitives" (ex: numero invalide) des erreurs transitoires
// ici faute de typage cote createPayment - a affiner si createPayment
// expose un code d'erreur exploitable.
async function initiatePaymentWithRetry(paymentProvider, paymentPayload) {
  let lastError;
  for (let attempt = 1; attempt <= PAYMENT_RETRY_ATTEMPTS; attempt++) {
    try {
      const payment = await createPayment(paymentProvider, paymentPayload);
      return payment;
    } catch (err) {
      lastError = err;
      console.warn(
        `Tentative ${attempt}/${PAYMENT_RETRY_ATTEMPTS} d'initiation paiement echouee:`,
        err,
      );
      if (attempt < PAYMENT_RETRY_ATTEMPTS) {
        await sleep(PAYMENT_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }
  throw lastError;
}

export async function POST(request) {
  const body = await request.json();
  const parsed = orderCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    items,
    addressId,
    guestFullName,
    guestPhone,
    guestEmail,
    paymentProvider,
  } = parsed.data;

  // getCurrentUser() ne decode que le JWT ({ sub, role, email }) : il ne
  // contient ni id Prisma exploitable via .id (c'est .sub), ni customerType,
  // ni phone. On va chercher l'enregistrement complet en base pour avoir
  // ces champs a jour (le JWT peut aussi etre perime de plusieurs jours).
  const session = await getCurrentUser(); // null si client non connecte
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.sub },
        select: {
          id: true,
          customerType: true,
          phone: true,
          fullName: true,
          email: true,
        },
      })
    : null;

  const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
  const now = new Date();

  try {
    // Un client connecte ne peut utiliser qu'une adresse qui lui appartient
    if (user && addressId) {
      const address = await prisma.address.findFirst({
        where: { id: addressId, userId: user.id },
        select: { id: true },
      });
      if (!address) {
        return NextResponse.json(
          { error: "Adresse invalide" },
          { status: 400 },
        );
      }
    }

    // Transaction interactive -> prismaDirect, cf. commentaire sur
    // releaseReservedStock plus haut (contournement du pooler Neon).
    // timeout releve : la connexion directe Neon peut etre plus lente que
    // le pooler (reveil du compute apres mise en veille "scale to zero").
    const order = await prismaDirect.$transaction(
      async (tx) => {
        // 1) Un seul aller-retour pour tous les produits + leurs promos
        //    actives (produit et categorie), au lieu d'une lecture par
        //    article dans la boucle. Cette lecture ne depend pas de l'issue
        //    de la reservation (les prix/promos ne changent pas selon le
        //    stock), donc rien n'oblige a la refaire item par item.
        const productIds = items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          include: {
            discounts: { where: activeDiscountsFilter(now) },
            category: {
              include: { discounts: { where: activeDiscountsFilter(now) } },
            },
          },
        });
        const productsById = new Map(products.map((p) => [p.id, p]));

        let total = 0;
        const orderItemsData = [];
        const reservationsData = [];

        for (const item of items) {
          const product = productsById.get(item.productId);
          if (!product) {
            throw new Error(`STOCK_INSUFFISANT:${item.productId}`);
          }

          // Reservation atomique : c'est la SEULE requete qui doit rester
          // sequentielle par article, car le check de disponibilite doit
          // porter sur l'etat exact au moment de l'ecriture, pas sur la
          // lecture batch ci-dessus qui peut etre legerement perimee.
          const reserved = await reserveStockAtomic(
            tx,
            item.productId,
            item.quantity,
          );
          if (!reserved) {
            throw new Error(`STOCK_INSUFFISANT:${product.name}`);
          }

          const priced = computePrice(product, item.quantity, now);

          reservationsData.push({
            productId: item.productId,
            quantity: item.quantity,
            sessionId,
            expiresAt: new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000),
          });

          total += priced.unitPrice * item.quantity;
          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: priced.unitPrice,
          });
        }

        // 2) Toutes les reservations en un seul aller-retour (createMany),
        //    au lieu d'un create() par article dans la boucle.
        if (reservationsData.length > 0) {
          await tx.stockReservation.createMany({ data: reservationsData });
        }

        const deliveryFee = 0; // TODO: calcul selon zone de livraison
        total += deliveryFee;

        return tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId: user?.id || null,
            addressId,
            sessionId,
            // Champs guest ignores si l'acheteur est connecte : on garde ses
            // infos de compte comme source de verite plutot que de dupliquer.
            guestFullName: user ? null : guestFullName,
            guestPhone: user ? null : guestPhone,
            guestEmail: user ? null : guestEmail,
            customerTypeAtOrder: user?.customerType || "DETAIL",
            deliveryFee,
            total,
            status: "EN_ATTENTE",
            items: { create: orderItemsData },
          },
          include: { items: true },
        });
      },
      {
        maxWait: 10000, // temps max pour obtenir une connexion avant demarrage
        timeout: 15000, // temps max d'execution total de la transaction
      },
    );

    let payment;
    try {
      payment = await initiatePaymentWithRetry(paymentProvider, {
        amount: order.total,
        orderNumber: order.orderNumber,
        returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?order=${order.orderNumber}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?order=${order.orderNumber}&status=failed`,
        callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook/${paymentProvider.toLowerCase()}`,
        payerNumber: guestPhone || user?.phone,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: paymentProvider,
          providerRef: payment.providerRef,
          amount: order.total,
          status: "EN_ATTENTE",
        },
      });
    } catch (paymentError) {
      // Toutes les tentatives de paiement ont echoue : on n'abandonne pas
      // une commande qui ne pourra jamais etre payee en gardant du stock
      // bloque pour rien. Annulation + liberation immediate du stock.
      console.error(
        `Paiement impossible pour la commande ${order.orderNumber} apres ${PAYMENT_RETRY_ATTEMPTS} tentatives:`,
        paymentError,
      );
      await releaseReservedStock(order, sessionId);
      return NextResponse.json(
        {
          error:
            "Le paiement n'a pas pu etre initie. Ta commande a ete annulee, tu peux reessayer.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      redirectUrl: payment.redirectUrl,
    });
  } catch (error) {
    if (error.message?.startsWith("STOCK_INSUFFISANT")) {
      const productName = error.message.split(":")[1];
      return NextResponse.json(
        { error: `Stock insuffisant pour "${productName}"` },
        { status: 409 },
      );
    }
    console.error("Erreur creation commande:", error);
    return NextResponse.json(
      { error: "Impossible de creer la commande" },
      { status: 500 },
    );
  }
}
