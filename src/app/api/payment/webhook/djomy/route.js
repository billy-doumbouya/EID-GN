import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { djomyWebhookSchema } from "@/lib/validators";
import { verifyPayment } from "@/lib/payments";
import {
  confirmOrderPayment,
  releaseStockReservation,
} from "@/lib/orderFulfillment";

// Meme principe que LengoPay : la redirection returnUrl n'est PAS une preuve de
// paiement. Seul verifyPayment() (appel serveur signe) fait foi. Traitement
// await avant la reponse — voir le commentaire detaille dans le webhook LengoPay.
export async function POST(request) {
  const body = await request.json();
  const parsed = djomyWebhookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    await processWebhook(parsed.data.transactionId);
  } catch (err) {
    console.error("Erreur traitement webhook Djomy:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processWebhook(transactionId) {
  const payment = await prisma.payment.findUnique({
    where: {
      provider_providerRef: { provider: "DJOMY", providerRef: transactionId },
    },
  });
  if (!payment) return;
  if (payment.status === "REUSSI") return; // idempotence

  const normalizedStatus = await verifyPayment("DJOMY", transactionId);

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: normalizedStatus, verifiedAt: new Date() },
  });

  if (normalizedStatus === "REUSSI") {
    await confirmOrderPayment(payment.orderId);
  } else if (normalizedStatus === "ECHOUE") {
    await releaseStockReservation(payment.orderId);
  }
}
