import nodemailer from "nodemailer";

// Transport unique pour les emails TRANSACTIONNELS (confirmation commande,
// reset password). Pour les envois en masse, voir broadcastEmail() plus bas
// qui doit passer par un fournisseur dedie (Brevo API) et non une boucle SMTP.

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendTransactionalEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

// src/lib/mailer.js — orderConfirmationTemplate mis a jour
export function orderConfirmationTemplate(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:4px 0;">${item.quantity} x ${item.product.name}</td>
          <td style="padding:4px 0; text-align:right;">
            ${(Number(item.unitPrice) * item.quantity).toLocaleString("fr-FR")} GNF
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#1A2332;">Commande confirmee</h2>
      <p>Bonjour ${order.guestFullName || order.user?.fullName || ""},</p>
      <p>Votre commande <strong>${order.orderNumber}</strong> a bien ete recue.</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
        ${itemsHtml}
      </table>

      <p>Total : <strong style="color:#EA580C;">${Number(order.total).toLocaleString("fr-FR")} GNF</strong></p>
      <p>Vous pouvez suivre votre commande depuis votre espace client.</p>
    </div>
  `;
}
export function resetPasswordTemplate(resetUrl) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#1A2332;">Reinitialisation du mot de passe</h2>
      <p>Cliquez sur le lien ci-dessous (valable 30 minutes) :</p>
      <a href="${resetUrl}" style="background:#EA580C;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">Reinitialiser mon mot de passe</a>
      <p style="color:#666;font-size:12px;margin-top:16px;">Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>
    </div>
  `;
}

// IMPORTANT : ne jamais boucler sendTransactionalEmail() pour un envoi de masse.
// Cette fonction est un point d'integration a brancher sur l'API Brevo (ou Mailgun/
// Resend) qui gere la queue, la reputation IP et les desabonnements.
export async function broadcastEmail({ subject, html, recipients }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM },
      to: recipients.map((email) => ({ email })),
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) throw new Error(`Envoi en masse Brevo a echoue: ${res.status}`);
  return res.json();
}