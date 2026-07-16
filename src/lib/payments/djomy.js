// Integration Djomy - https://developers.djomy.africa
// Auth en 2 etapes : HMAC-SHA256(clientId, clientSecret) -> POST /v1/auth -> Bearer token
// Chaque requete authentifiee exige DEUX headers : Authorization Bearer + X-API-KEY

import crypto from "crypto";

const BASE_URL = process.env.DJOMY_BASE_URL || "https://sandbox-api.djomy.africa";

function computeApiKeyHeader() {
  const clientId = process.env.DJOMY_CLIENT_ID;
  const clientSecret = process.env.DJOMY_CLIENT_SECRET;
  const signature = crypto.createHmac("sha256", clientSecret).update(clientId).digest("hex");
  return `${clientId}:${signature}`;
}

async function getBearerToken() {
  const apiKey = computeApiKeyHeader();
  const res = await fetch(`${BASE_URL}/v1/auth`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey },
  });
  if (!res.ok) throw new Error(`Djomy auth a echoue: ${res.status}`);
  const data = await res.json();
  return data.token;
}

// Flow recommande par la doc : create_payment_gateway (delegue la selection du
// mode de paiement + l'OTP au portail Djomy, plus simple a integrer cote UI).
export async function djomyCreatePaymentGateway({ amount, orderNumber, returnUrl, payerNumber }) {
  const token = await getBearerToken();
  const apiKey = computeApiKeyHeader();

  const res = await fetch(`${BASE_URL}/v1/payment-gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: "GNF",
      transactionReference: orderNumber,
      returnUrl,
      payerNumber, // obligatoire meme si documente comme "pre-remplissage"
    }),
  });

  if (!res.ok) throw new Error(`Djomy create_payment_gateway a echoue: ${res.status}`);
  return res.json(); // { transactionId, redirectUrl }
}

export async function djomyVerifyPayment(transactionId) {
  const token = await getBearerToken();
  const apiKey = computeApiKeyHeader();

  const res = await fetch(`${BASE_URL}/v1/payments/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${token}`, "X-API-KEY": apiKey },
  });

  if (!res.ok) throw new Error(`Djomy verify a echoue: ${res.status}`);
  return res.json(); // { status: "SUCCESS" | "PENDING" | "FAILED" }
}
