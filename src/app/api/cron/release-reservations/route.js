import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CRITIQUE pour l'anti-survente : libere le stock reserve dont la fenetre de
// checkout (15 min) a expire sans paiement confirme. Sans ce cron, un panier
// abandonne avant paiement bloquerait le stock indefiniment.
// A appeler via Vercel Cron toutes les 5 minutes.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const expiredReservations = await prisma.stockReservation.findMany({
    where: { expiresAt: { lt: new Date() } },
    take: 200,
  });

  let released = 0;
  for (const reservation of expiredReservations) {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: reservation.productId },
        data: { reservedStock: { decrement: reservation.quantity } },
      });
      await tx.stockReservation.delete({ where: { id: reservation.id } });
    });
    released++;
  }

  return NextResponse.json({ released });
}
