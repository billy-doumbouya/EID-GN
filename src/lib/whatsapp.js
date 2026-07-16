// Fichier CLIENT-SAFE uniquement : importe par WhatsAppWidget.jsx ("use client").
// Ne doit jamais importer le SDK Twilio (Node-only, casse le bundle navigateur -
// erreur reelle rencontree au build : "Module not found: fs/net/tls").
export function buildWhatsAppLink({ phoneNumber, message }) {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message || "Bonjour, je suis interesse par vos produits.");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
