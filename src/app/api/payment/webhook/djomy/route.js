import crypto from "crypto";
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
//
// Djomy signe chaque webhook: header X-Webhook-Signature au format "v1:<hex>",
// hex = HMAC-SHA256(rawBody, DJOMY_CLIENT_SECRET). Sans cette verification,
// n'importe qui connaissant un transactionId peut appeler cet endpoint.
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "DJOMY webhook endpoint is ready" },
    { status: 200 }
  );
}

export async function POST(request) {
  const rawBody = await request.text();

  if (
    !isValidDjomySignature(rawBody, request.headers.get("x-webhook-signature"))
  ) {
    console.error("Djomy webhook: signature invalide ou absente");
    return NextResponse.json({ received: false }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

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

function isValidDjomySignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;

  const [version, hexSignature] = signatureHeader.split(":");
  if (version !== "v1" || !hexSignature) return false;

  const secret = process.env.DJOMY_CLIENT_SECRET;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(hexSignature, "hex");

  // Longueurs differentes => timingSafeEqual leve une exception, donc on la
  // court-circuite explicitement avant de comparer.
  if (expectedBuf.length !== receivedBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
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
