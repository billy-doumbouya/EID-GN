// src/app/api/orders/route.js
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validators";
import { createPayment } from "@/lib/payments";
import { computePrice } from "@/lib/pricing/computePrice";

const RESERVATION_MINUTES = 15;

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

// Reserve le stock de facon atomique : verifie ET incremente en une seule
// instruction SQL, pour ne pas laisser de fenetre de course entre la lecture
// du stock disponible et son ecriture (voir dette technique identifiee plus tot).
async function reserveStockAtomic(tx, productId, quantity) {
  const result = await tx.$executeRaw`
    UPDATE "Product"
    SET "reservedStock" = "reservedStock" + ${quantity}
    WHERE id = ${productId} AND stock - "reservedStock" >= ${quantity}
  `;
  return result > 0; // 0 ligne affectee = stock insuffisant au moment exact de l'ecriture
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
  const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
  const now = new Date();

  try {
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        // 1) Reservation atomique EN PREMIER, avant meme de lire le produit
        //    pour le calcul de prix. C'est cette instruction qui fait autorite
        //    sur la disponibilite reelle, pas une lecture separee.
        const reserved = await reserveStockAtomic(
          tx,
          item.productId,
          item.quantity,
        );
        if (!reserved) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          });
          throw new Error(
            `STOCK_INSUFFISANT:${product?.name || item.productId}`,
          );
        }

        // 2) Une fois la reservation garantie, on peut lire le produit pour le
        //    prix sans risque : le stock qu'on vient de reserver ne bougera
        //    plus sous nos pieds pour cet article dans cette transaction.
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          include: {
            discounts: { where: activeDiscountsFilter(now) },
            category: {
              include: { discounts: { where: activeDiscountsFilter(now) } },
            },
          },
        });

        const priced = computePrice(product, item.quantity, now);

        await tx.stockReservation.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            sessionId,
            expiresAt: new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000),
          },
        });

        subtotal += priced.unitPrice * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: priced.unitPrice,
        });
      }

      const deliveryFee = 0; // TODO: calcul selon zone de livraison
      const total = subtotal + deliveryFee;

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          addressId,
          guestFullName,
          guestPhone,
          guestEmail,
          subtotal,
          deliveryFee,
          total,
          status: "EN_ATTENTE",
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
    });

    const payment = await createPayment(paymentProvider, {
      amount: order.total,
      orderNumber: order.orderNumber,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?order=${order.orderNumber}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook/${paymentProvider.toLowerCase()}`,
      payerNumber: guestPhone,
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
