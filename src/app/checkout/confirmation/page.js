// src/app/checkout/confirmation/ConfirmationStatus.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";

const PAID_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // ~1 minute avant d'arreter et laisser le message "verifiez vos emails"

export function ConfirmationStatus({ orderNumber, initialStatus, total }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pollCount, setPollCount] = useState(0);

  const isPaid = PAID_STATUSES.includes(status);

  useEffect(() => {
    if (isPaid || pollCount >= MAX_POLLS) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (PAID_STATUSES.includes(data.status)) {
            router.refresh(); // resynchronise le reste de la page (items, etc.)
          }
        }
      } catch {
        // silencieux : on retente au prochain intervalle
      }
      setPollCount((c) => c + 1);
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [isPaid, pollCount, orderNumber, router]);

  return (
    <>
      {isPaid ? (
        <CheckCircle2 size={56} className="mx-auto text-success" />
      ) : (
        <Clock size={56} className="mx-auto animate-pulse text-amber-500" />
      )}
      <h1 className="mt-4 font-display text-xl font-semibold text-navy-900">
        {isPaid ? "Paiement confirme" : "Paiement en cours de verification"}
      </h1>
      <p className="mt-2 text-navy-800/70">
        Commande <strong>{orderNumber}</strong> —{" "}
        {Number(total).toLocaleString("fr-FR")} GNF
      </p>
      {!isPaid && (
        <p className="mt-2 text-sm text-navy-800/50">
          {pollCount >= MAX_POLLS
            ? "La verification prend plus de temps que prevu. Vous recevrez un email des que c'est confirme."
            : "Si vous venez de payer, la confirmation peut prendre quelques instants."}
        </p>
      )}
    </>
  );
}
