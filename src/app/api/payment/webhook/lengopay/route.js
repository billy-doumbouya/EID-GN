import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lengopayWebhookSchema } from "@/lib/validators";
import { verifyPayment } from "@/lib/payments";
import {
  confirmOrderPayment,
  releaseStockReservation,
} from "@/lib/orderFulfillment";

// Regles imperatives (voir doc LengoPay) :
// 1. Repondre HTTP 200 - LengoPay retry en cas d'echec/lenteur, ce qui peut
//    generer des doublons si le handler echoue avant de repondre.
// 2. Ne JAMAIS faire confiance au webhook seul : toujours re-verifier le statut
//    cote serveur via verifyPayment avant de valider la commande (le webhook
//    peut etre forge par quiconque connait votre callback_url).
// 3. Idempotence : le meme webhook peut arriver plusieurs fois pour le meme pay_id.
// 4. Le traitement est AWAIT avant la reponse (pas de fire-and-forget) : sur un
//    runtime serverless, du code lance apres le retour de la reponse HTTP peut
//    etre tue avant d'avoir fini, ce qui laisserait une commande payee bloquee
//    en EN_ATTENTE silencieusement. On accepte le leger delai de reponse en
//    echange de la garantie que le traitement va au bout.
export async function POST(request) {
  const body = await request.json();
  const parsed = lengopayWebhookSchema.safeParse(body);

  if (!parsed.success) {
    // On repond 200 quand meme pour eviter un retry infini sur un payload
    // qu'on ne saura de toute facon jamais traiter.
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    await processWebhook(parsed.data.pay_id);
  } catch (err) {
    console.error("Erreur traitement webhook LengoPay:", err);
    // On repond quand meme 200 : une erreur interne ne doit pas declencher
    // un retry en boucle du cote LengoPay sur un webhook qu'on a bien recu.
    // L'erreur est loguee pour investigation manuelle.
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processWebhook(payId) {
  const payment = await prisma.payment.findUnique({
    where: {
      provider_providerRef: { provider: "LENGOPAY", providerRef: payId },
    },
  });
  if (!payment) return;

  // Idempotence : si deja traite avec succes, on ne refait rien.
  if (payment.status === "REUSSI") return;

  const normalizedStatus = await verifyPayment("LENGOPAY", payId);

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
