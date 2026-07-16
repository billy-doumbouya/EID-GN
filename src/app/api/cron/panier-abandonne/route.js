import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/mailer";

const ABANDON_THRESHOLD_HOURS = 2;

// A appeler via Vercel Cron toutes les 30 minutes : relance les commandes
// creees mais jamais payees, une seule fois par commande.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const threshold = new Date(Date.now() - ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000);

  const abandonedOrders = await prisma.order.findMany({
    where: {
      status: "EN_ATTENTE",
      createdAt: { lt: threshold },
      abandonedReminderSentAt: null,
      guestEmail: { not: null },
    },
    take: 50,
  });

  for (const order of abandonedOrders) {
    await sendTransactionalEmail({
      to: order.guestEmail,
      subject: "Votre commande vous attend",
      html: `<p>Bonjour, votre commande ${order.orderNumber} n'a pas encore ete payee. Finalisez-la avant expiration de la reservation de stock.</p>`,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { abandonedReminderSentAt: new Date() },
    });
  }

  return NextResponse.json({ remindersSent: abandonedOrders.length });
}
