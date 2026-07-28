import nodemailer from "nodemailer";

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

/**
 * TEMPLATE 1 : Confirmation de commande (Glassmorphism & Mobile First)
 */
export function orderConfirmationTemplate(order) {
  const recipientName = order.guestFullName || order.user?.fullName || "Client";

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(226, 232, 240, 0.6); color: #334155; font-size: 14px; font-weight: 500;">
            ${item.quantity}x <span style="color: #0f172a; font-weight: 600;">${item.product.name}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(226, 232, 240, 0.6); text-align: right; color: #0f172a; font-size: 14px; font-weight: 700; whitespace: nowrap;">
            ${(Number(item.unitPrice) * item.quantity).toLocaleString("fr-FR")} GNF
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <!-- CONTENEUR GLOBAL DÉGRADÉ GLASS -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%); padding: 24px 12px;">
        <tr>
          <td align="center">
            
            <!-- CARTE GLASSMAIN -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: rgba(255, 255, 255, 0.85); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); overflow: hidden;">
              
              <!-- EN-TÊTE / BADGE -->
              <tr>
                <td style="padding: 32px 24px 16px 24px; text-align: center;">
                  <div style="display: inline-block; background: rgba(234, 88, 12, 0.1); border: 1px solid rgba(234, 88, 12, 0.2); border-radius: 9999px; padding: 6px 16px; margin-bottom: 12px;">
                    <span style="color: #ea580c; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">Commande Confirmée</span>
                  </div>
                  <h1 style="margin: 8px 0 0 0; color: #0f172a; font-size: 22px; font-weight: 800; tracking: -0.025em;">
                    Merci pour votre achat !
                  </h1>
                </td>
              </tr>

              <!-- CONTENU -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">
                    Bonjour <strong style="color: #0f172a;">${recipientName}</strong>, nous avons bien reçu votre commande <span style="background: rgba(241, 245, 249, 0.8); padding: 2px 8px; border-radius: 6px; font-family: monospace; font-weight: 600; color: #334155;">#${order.orderNumber}</span>.
                  </p>

                  <!-- RECAPITULATIF (SECTION INTERNE GLASS) -->
                  <div style="background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 16px; padding: 16px; margin: 20px 0;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${itemsHtml}
                    </table>

                    <!-- TOTAL -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px; padding-top: 12px; border-top: 2px dashed rgba(203, 213, 225, 0.6);">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: 600;">Total Réglé</td>
                        <td style="text-align: right; color: #ea580c; font-size: 18px; font-weight: 800;">
                          ${Number(order.total).toLocaleString("fr-FR")} GNF
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- BOUTON D'ACTION MOBILE-FIRST -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/mes-commandes" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff; text-decoration: none; text-align: center; font-size: 14px; font-weight: 700; padding: 14px 24px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(234, 88, 12, 0.3);">
                          Suivre ma commande
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- PIED DE PAGE -->
              <tr>
                <td style="padding: 16px 24px 24px 24px; background-color: rgba(248, 250, 252, 0.5); text-align: center; border-top: 1px solid rgba(226, 232, 240, 0.6);">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                    Besoin d'aide ? Contactez notre support client.<br>
                    © ${new Date().getFullYear()} Votre Store. Tous droits réservés.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * TEMPLATE 2 : Réinitialisation de mot de passe (Glassmorphism & Mobile First)
 */
export function resetPasswordTemplate(resetUrl) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <!-- CONTENEUR GLOBAL DÉGRADÉ GLASS -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 12px; min-height: 100vh;">
        <tr>
          <td align="center">
            
            <!-- CARTE GLASS MAIN DARK / CONTRAST -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 460px; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;">
              
              <!-- EN-TÊTE -->
              <tr>
                <td style="padding: 32px 24px 16px 24px; text-align: center;">
                  <div style="display: inline-block; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 12px; margin-bottom: 16px;">
                    <!-- Icône Cadenas Muted -->
                    <span style="font-size: 24px;">🔒</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; tracking: -0.025em;">
                    Mot de passe oublié ?
                  </h1>
                </td>
              </tr>

              <!-- CONTENU -->
              <tr>
                <td style="padding: 0 24px 28px 24px; text-align: center;">
                  <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                    Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.
                  </p>

                  <!-- BOUTON D'ACTION GLASS-ORANGE MOBILE FIRST -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; text-align: center; font-size: 14px; font-weight: 700; padding: 14px 24px; border-radius: 12px; box-shadow: 0 10px 20px -5px rgba(234, 88, 12, 0.4);">
                          Réinitialiser mon mot de passe
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- INFO EXPIRATION -->
                  <div style="margin-top: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px;">
                    <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                      ⏳ Ce lien est valable pendant <strong style="color: #cbd5e1;">30 minutes</strong>.<br>
                      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
                    </p>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function broadcastEmail({ subject, html, recipients }) {
  let sent = 0;
  const failed = [];

  for (const to of recipients) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Envoi email échoué pour ${to}:`, err);
      failed.push(to);
    }
  }

  return { sent, failed };
}
