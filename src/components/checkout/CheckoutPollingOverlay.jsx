"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ExternalLink, X } from "lucide-react";
import { useOrderStatus } from "@/hooks/useOrderStatus";

const PAID_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const FAILED_STATUSES = ["ANNULEE"];

export function CheckoutPollingOverlay({ orderNumber, popup, onDone }) {
  const { status, isStalled } = useOrderStatus({
    orderNumber,
    initialStatus: "EN_ATTENTE",
    enabled: true,
    onSuccess: (newStatus) => {
      if (
        PAID_STATUSES.includes(newStatus) ||
        FAILED_STATUSES.includes(newStatus)
      ) {
        popup?.close();
        onDone(newStatus);
      }
    },
  });

  // Si l'utilisateur ferme le popup manuellement
  useEffect(() => {
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        // Ne pas rediriger — laisser l'utilisateur reprendre
      }
    }, 1000);
    return () => clearInterval(checkPopup);
  }, [popup]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="polling-title"
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-900 p-8 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mechanic-500/10 border border-mechanic-500/20 mb-5">
          <Loader2 className="h-7 w-7 text-mechanic-400 animate-spin" />
        </div>

        <h2 id="polling-title" className="font-display text-lg font-bold text-white">
          Paiement en cours
        </h2>
        <p className="mt-2 text-sm text-offwhite-100/60 leading-relaxed">
          Complétez votre paiement dans l'onglet ouvert. Cette page se mettra à
          jour automatiquement.
        </p>

        {isStalled && (
          <p className="mt-3 text-xs text-amber-400">
            Cela prend plus de temps que prévu. Si vous avez payé, contactez le support.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              if (popup && !popup.closed) {
                popup.focus();
              } else if (orderNumber) {
                // Si la popup a été fermée, on peut retenter d'ouvrir la page de statut
                window.location.href = `/checkout/confirmation?order=${orderNumber}`;
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 hover:border-white/30 px-4 py-2.5 text-sm text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            Accéder à l'onglet de paiement
          </button>
          <button
            type="button"
            onClick={() => {
              popup?.close();
              onDone("EN_ATTENTE");
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs text-offwhite-100/50 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
