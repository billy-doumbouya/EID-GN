// Couche d'abstraction PaymentProvider - permet de basculer/ajouter un fournisseur
// sans toucher a la logique metier (checkout, webhooks, commandes).

import { lengopayCreatePayment, lengopayVerifyPayment } from "./lengopay";
import { djomyCreatePaymentGateway, djomyVerifyPayment } from "./djomy";

export async function createPayment(provider, params) {
  if (provider === "LENGOPAY") {
    const result = await lengopayCreatePayment(params);
    return { providerRef: result.pay_id, redirectUrl: result.payment_url };
  }
  if (provider === "DJOMY") {
    const result = await djomyCreatePaymentGateway(params);
    return { providerRef: result.transactionId, redirectUrl: result.redirectUrl };
  }
  throw new Error(`Fournisseur de paiement inconnu: ${provider}`);
}

// Retourne toujours un statut normalise : "REUSSI" | "ECHOUE" | "EN_ATTENTE"
export async function verifyPayment(provider, providerRef) {
  if (provider === "LENGOPAY") {
    const result = await lengopayVerifyPayment(providerRef);
    return normalizeStatus(result.status);
  }
  if (provider === "DJOMY") {
    const result = await djomyVerifyPayment(providerRef);
    return normalizeStatus(result.status);
  }
  throw new Error(`Fournisseur de paiement inconnu: ${provider}`);
}

function normalizeStatus(rawStatus) {
  const s = String(rawStatus).toUpperCase();
  if (s === "SUCCESS" || s === "REUSSI") return "REUSSI";
  if (s === "FAILED" || s === "ECHEC") return "ECHOUE";
  return "EN_ATTENTE";
}
