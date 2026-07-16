// Integration LengoPay - https://www.lengopay.com
// Points d'attention (voir doc) :
// - "amount" doit etre une STRING numerique, jamais un number (erreur 400 sinon)
// - "pay_id" retourne est encode en base64, a conserver tel quel (ne pas decoder)
// - callback_url doit etre en HTTPS, sinon ignore silencieusement

const BASE_URL = process.env.LENGOPAY_BASE_URL || "https://sandbox.lengopay.com/api";

export async function lengopayCreatePayment({ amount, orderNumber, returnUrl, callbackUrl }) {
  const res = await fetch(`${BASE_URL}/v1/create_payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LENGOPAY_LICENSE_KEY}`,
    },
    body: JSON.stringify({
      websiteid: process.env.LENGOPAY_WEBSITE_ID,
      amount: String(amount), // toujours en string cote LengoPay
      currency: "GNF",
      return_url: returnUrl,
      callback_url: callbackUrl, // doit etre https:// en production
      client_reference: orderNumber,
    }),
  });

  if (!res.ok) {
    throw new Error(`LengoPay create_payment a echoue: ${res.status}`);
  }

  return res.json(); // { pay_id, payment_url, status }
}

export async function lengopayVerifyPayment(payId) {
  // pay_id doit rester tel quel (base64), ne jamais le decoder avant l'appel
  const res = await fetch(`${BASE_URL}/v1/cashin_status/${encodeURIComponent(payId)}`, {
    headers: { Authorization: `Bearer ${process.env.LENGOPAY_LICENSE_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`LengoPay verify a echoue: ${res.status}`);
  }

  return res.json();
}
