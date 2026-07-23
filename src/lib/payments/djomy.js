// Integration Djomy - https://developers.djomy.africa
// Auth en 2 etapes : HMAC-SHA256(message=clientId, key=clientSecret) -> POST /v1/auth -> Bearer token
// Chaque requete authentifiee exige DEUX headers : Authorization Bearer + X-API-KEY
//
// IMPORTANT : toutes les reponses Djomy sont enveloppees dans
// { success, message, data, error, timestamp, status }.
// Le token n'est PAS dans data.token mais dans data.accessToken (result.data.accessToken).
// C'etait le bug racine du 401 : Authorization: Bearer undefined car on lisait data.token.

import crypto from "crypto";

const BASE_URL =
  process.env.DJOMY_BASE_URL || "https://sandbox-api.djomy.africa";

function computeApiKeyHeader() {
  const clientId = process.env.DJOMY_CLIENT_ID;
  const clientSecret = process.env.DJOMY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Djomy: DJOMY_CLIENT_ID et DJOMY_CLIENT_SECRET sont requis",
    );
  }
  const signature = crypto
    .createHmac("sha256", clientSecret)
    .update(clientId)
    .digest("hex");
  return `${clientId}:${signature}`;
}

// Helper commun : lit l'enveloppe { success, data, error, message } et
// leve une erreur exploitable si success === false, sinon renvoie data.
async function readDjomyEnvelope(res, label) {
  if (!res.ok) throw new Error(`Djomy ${label} a echoue: ${res.status}`);
  const result = await res.json();
  if (!result.success) {
    throw new Error(
      `Djomy ${label} error: ${result.error?.message ?? result.message}`,
    );
  }
  return result.data;
}

async function getBearerToken() {
  const apiKey = computeApiKeyHeader();
  const res = await fetch(`${BASE_URL}/v1/auth`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
  });
  const data = await readDjomyEnvelope(res, "auth");
  return data.accessToken; // <- avant: data.token (toujours undefined)
}

// Flow recommande par la doc : create_payment_gateway (delegue la selection du
// mode de paiement + l'OTP au portail Djomy, plus simple a integrer cote UI).
export async function djomyCreatePaymentGateway({
  amount,
  countryCode = "GN",
  orderNumber,
  returnUrl,
  cancelUrl,
  payerNumber,
  allowedPaymentMethods,
  metadata,
}) {
  const token = await getBearerToken();
  const apiKey = computeApiKeyHeader();

  // Endpoint correct: /v1/payments/gateway (pas /v1/payment-gateway)
  const res = await fetch(`${BASE_URL}/v1/payments/gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      amount: Number(amount), // number, pas string
      countryCode, // requis par l'API, remplace currency
      payerNumber, // obligatoire meme si documente comme "pre-remplissage"
      merchantPaymentReference: orderNumber, // remplace transactionReference
      ...(returnUrl && { returnUrl }),
      ...(cancelUrl && { cancelUrl }),
      ...(allowedPaymentMethods && { allowedPaymentMethods }),
      ...(metadata && { metadata }),
    }),
  });

  const data = await readDjomyEnvelope(res, "create_payment_gateway");
  return data; // { transactionId, redirectUrl, paymentUrl, status, ... }
}

export async function djomyVerifyPayment(transactionId) {
  const token = await getBearerToken();
  const apiKey = computeApiKeyHeader();

  // Endpoint correct: /v1/payments/{id}/status (pas /verify)
  const res = await fetch(`${BASE_URL}/v1/payments/${transactionId}/status`, {
    headers: { Authorization: `Bearer ${token}`, "X-API-KEY": apiKey },
  });

  return readDjomyEnvelope(res, "verify_payment"); // { status, receivedAmount, ... }
}
