import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appendOrderToSheet } from "@/lib/sheets";

// Filet de securite : rattrape les commandes payees jamais synchronisees vers
// le Google Sheet (ex: si l'appel synchrone a echoue au moment du paiement).
// A appeler via un Vercel Cron (vercel.json) toutes les 15 minutes.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const unsyncedOrders = await prisma.order.findMany({
    where: { status: "PAYEE", syncedToSheet: false },
    include: { items: { include: { product: true } }, user: true },
    take: 50,
  });

  let synced = 0;
  for (const order of unsyncedOrders) {
    try {
      await appendOrderToSheet(order);
      await prisma.order.update({
        where: { id: order.id },
        data: { syncedToSheet: true, syncedToSheetAt: new Date() },
      });
      synced++;
    } catch (err) {
      console.error(`Sync Sheet echouee pour ${order.orderNumber}:`, err);
    }
  }

  return NextResponse.json({ synced, total: unsyncedOrders.length });
}
