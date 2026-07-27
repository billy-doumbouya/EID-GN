import { prisma, prismaDirect } from "@/lib/prisma";
import { generateAndUploadReceipt } from "./receipts";
// Garde ici tes imports reels existants pour :
// generateAndUploadReceipt, sendTransactionalEmail,
// orderConfirmationTemplate, appendOrderToSheet
// (non visibles dans le fichier que tu m'as montre)

// Confirme le paiement d'une commande : decremente le stock reel, libere
// la reservation, marque la commande PAYEE, puis effectue le post-traitement
// (recu PDF, email, sync Google Sheet).
//
// Transaction interactive -> prismaDirect (le pooler Neon/PgBouncer en mode
// "transaction" ne supporte pas prisma.$transaction(async (tx) => {...}),
// cf. P2028 — meme piege que releaseReservedStock dans /api/orders).
export async function confirmOrderPayment(orderId) {
  const order = await prismaDirect.$transaction(
    async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: orderId } });
      if (!existing || existing.status === "PAYEE") return null;

      const items = await tx.orderItem.findMany({ where: { orderId } });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity },
          },
        });
      }

      // Scope precis : uniquement les reservations de CETTE session/commande,
      // pas celles d'autres clients en checkout simultane sur le meme produit.
      await tx.stockReservation.deleteMany({
        where: {
          productId: { in: items.map((i) => i.productId) },
          sessionId: existing.sessionId,
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { status: "PAYEE" },
        include: { items: { include: { product: true } }, user: true },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  );

  if (!order) return;

  try {
    const pdfUrl = await generateAndUploadReceipt(order);
    await prisma.receipt.create({ data: { orderId: order.id, pdfUrl } });

    if (order.guestEmail || order.user?.email) {
      await sendTransactionalEmail({
        to: order.guestEmail || order.user.email,
        subject: `Commande confirmee - ${order.orderNumber}`,
        html: orderConfirmationTemplate(order),
      });
    }

    await appendOrderToSheet(order);
    await prisma.order.update({
      where: { id: order.id },
      data: { syncedToSheet: true, syncedToSheetAt: new Date() },
    });
  } catch (err) {
    console.error("Post-traitement commande (recu/email/sheet) a echoue:", err);
  }
}

// Libere le stock reserve pour une commande dont le paiement a echoue.
// Meme piege P2028 -> prismaDirect pour la transaction interactive.
export async function releaseStockReservation(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.status !== "EN_ATTENTE") return;

  await prismaDirect.$transaction(
    async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: { decrement: item.quantity } },
        });
      }
      await tx.stockReservation.deleteMany({
        where: {
          productId: { in: order.items.map((i) => i.productId) },
          sessionId: order.sessionId,
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "ANNULEE" },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  );
}
