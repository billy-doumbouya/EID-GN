"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Bouton flottant "click-to-chat" - aucune API WhatsApp Business requise ici.
// contextMessage permet de pre-remplir le message (ex: reference produit) quand
// le widget est monte depuis une fiche produit ou depuis l'escalade du chatbot.
export function WhatsAppWidget({ contextMessage }) {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = buildWhatsAppLink({
    phoneNumber,
    message: contextMessage || "Bonjour, j'ai une question sur vos produits.",
  });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <MessageCircle size={26} strokeWidth={2} />
    </a>
  );
}
