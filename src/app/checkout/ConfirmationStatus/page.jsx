"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const PAID_STATUSES = ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const FAILED_STATUSES = ["ANNULEE"];
const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15;

export function ConfirmationStatus({ orderNumber, initialStatus, total }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pollCount, setPollCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isPaid = PAID_STATUSES.includes(status);
  const isFailed = FAILED_STATUSES.includes(status);

  useEffect(() => {
    if (isPaid || isFailed || pollCount >= MAX_POLLS) return;

    const delay = pollCount === 0 ? 0 : POLL_INTERVAL_MS;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`);
        if (res.ok && mountedRef.current) {
          const data = await res.json();
          setStatus(data.status);
          if (PAID_STATUSES.includes(data.status)) {
            router.refresh();
          }
        }
      } catch {
        // silencieux : on retente au prochain intervalle
      }
      if (mountedRef.current) setPollCount((c) => c + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPaid, isFailed, pollCount, orderNumber, router]);

  return (
    <>
      {isPaid ? (
        <CheckCircle2 size={56} className="mx-auto text-success" />
      ) : isFailed ? (
        <XCircle size={56} className="mx-auto text-danger" />
      ) : (
        <Clock size={56} className="mx-auto animate-pulse text-amber-500" />
      )}
      <h1 className="mt-4 font-display text-xl font-semibold text-navy-900">
        {isPaid
          ? "Paiement confirme"
          : isFailed
            ? "Paiement echoue"
            : "Paiement en cours de verification"}
      </h1>
      <p className="mt-2 text-navy-800/70">
        Commande <strong>{orderNumber}</strong> —{" "}
        {Number(total).toLocaleString("fr-FR")} GNF
      </p>
      {isFailed && (
        <p className="mt-2 text-sm text-navy-800/60">
          Le paiement n'a pas abouti et la commande a ete annulee (stock
          libere).{" "}
          <Link
            href="/cart"
            className="font-medium text-mechanic-500 hover:underline"
          >
            Reessayer la commande
          </Link>
        </p>
      )}
      {!isPaid && !isFailed && (
        <p className="mt-2 text-sm text-navy-800/50">
          {pollCount >= MAX_POLLS
            ? "La verification prend plus de temps que prevu. Vous recevrez un email des que c'est confirme."
            : "Si vous venez de payer, la confirmation peut prendre quelques instants."}
        </p>
      )}
    </>
  );
}
