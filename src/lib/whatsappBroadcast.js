import twilio from "twilio";

// Fichier SERVEUR UNIQUEMENT (SDK Twilio = Node-only). Importe uniquement
// depuis des Route Handlers (src/app/api/**), jamais depuis un composant
// "use client" - separe de whatsapp.js pour cette raison precise.
//
// Diffusion WhatsApp en masse via Twilio - retenu plutot que l'integration
// directe Meta Cloud API pour un onboarding plus rapide (sandbox Twilio
// disponible sans verification Meta Business Manager complete).
//
// Meme contrainte sous-jacente que Meta : en dehors d'une conversation initiee
// par le client dans les dernieres 24h, seul un "Content Template" WhatsApp
// pre-approuve peut etre envoye (Twilio Console > Content Template Builder).
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsAppTemplate({ to, contentSid, contentVariables }) {
  const cleanPhone = to.replace(/\D/g, "");

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM, // ex: "whatsapp:+14155238886" (sandbox) ou numero valide en prod
    to: `whatsapp:+${cleanPhone}`,
    contentSid, // SID du Content Template pre-approuve (ex: "HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    contentVariables: JSON.stringify(contentVariables || {}),
  });
}
