// Integration Djomy - https://developers.djomy.africa
// Auth en 2 etapes : HMAC-SHA256(message=clientId, key=clientSecret) -> POST /v1/auth -> Bearer token
// Chaque requete authentifiee exige DEUX headers : Authorization Bearer + X-API-KEY

import crypto from "crypto";
import axios from "axios";

const BASE_URL =
  process.env.DJOMY_BASE_URL || "https://sandbox-api.djomy.africa";

// Client Axios preconfigure
const djomyClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Helper commun : extrait la donnee de l'enveloppe { success, data, error, message }
// et leve une erreur exploitable si success === false ou en cas d'erreur HTTP.
function unwrapDjomyResponse(response, label) {
  const result = response.data;

  // Log de debug
  console.log(
    `DJOMY raw response [${label}]:`,
    JSON.stringify(result, null, 2),
  );

  if (!result || result.success === false) {
    const errorMsg =
      result?.error?.message || result?.message || "Erreur inconnue Djomy";
    throw new Error(`Djomy ${label} error: ${errorMsg}`);
  }

  return result.data;
}

async function getBearerToken() {
  const apiKey = computeApiKeyHeader();

  try {
    const response = await djomyClient.post(
      "/v1/auth",
      {},
      {
        headers: {
          "X-API-KEY": apiKey,
        },
      },
    );

    const data = unwrapDjomyResponse(response, "auth");
    return data.accessToken; // data.accessToken (pas data.token)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        error.message;
      throw new Error(`Djomy auth HTTP ${error.response.status}: ${apiError}`);
    }
    throw error;
  }
}

// Flow recommande par la doc : create_payment_gateway
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

  try {
    const response = await djomyClient.post(
      "/v1/payments/gateway",
      {
        amount: Number(amount),
        countryCode,
        payerNumber,
        merchantPaymentReference: orderNumber,
        ...(returnUrl && { returnUrl }),
        ...(cancelUrl && { cancelUrl }),
        ...(allowedPaymentMethods && { allowedPaymentMethods }),
        ...(metadata && { metadata }),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-KEY": apiKey,
        },
      },
    );

    return unwrapDjomyResponse(response, "create_payment_gateway");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        error.message;
      throw new Error(
        `Djomy create_payment_gateway HTTP ${error.response.status}: ${apiError}`,
      );
    }
    throw error;
  }
}

export async function djomyVerifyPayment(transactionId) {
  const token = await getBearerToken();
  const apiKey = computeApiKeyHeader();

  try {
    const response = await djomyClient.get(
      `/v1/payments/${transactionId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-KEY": apiKey,
        },
      },
    );

    return unwrapDjomyResponse(response, "verify_payment");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        error.message;
      throw new Error(
        `Djomy verify_payment HTTP ${error.response.status}: ${apiError}`,
      );
    }
    throw error;
  }
}
