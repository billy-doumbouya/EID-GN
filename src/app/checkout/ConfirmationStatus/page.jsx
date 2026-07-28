"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";

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
    <div className="mx-auto my-8 max-w-md rounded-3xl bg-[#e6eef8] p-8 text-center shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff]">
      {/* BADGE D'ICÔNE SOFT UI */}
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#e6eef8] shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
        {isPaid ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
        ) : isFailed ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <XCircle size={40} className="text-rose-500" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <Clock size={40} className="animate-pulse text-amber-500" />
          </div>
        )}
      </div>

      {/* TITRE ET ÉTAT */}
      <h1 className="mt-6 font-display text-xl font-bold text-slate-800">
        {isPaid
          ? "Paiement confirmé"
          : isFailed
            ? "Paiement échoué"
            : "Vérification du paiement"}
      </h1>

      {/* RÉCAPITULATIF DE LA COMMANDE */}
      <div className="mt-4 rounded-2xl bg-[#e6eef8] px-4 py-3 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
        <p className="text-xs font-semibold text-slate-600">
          Commande <span className="text-slate-900">#{orderNumber}</span>
        </p>
        <p className="mt-0.5 text-base font-bold text-mechanic-500">
          {Number(total).toLocaleString("fr-FR")} GNF
        </p>
      </div>

      {/* MESSAGES D'EXPLICATION */}
      {isFailed && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-medium text-slate-500">
            Le paiement n'a pas abouti et la commande a été annulée (les stocks
            ont été libérés).
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#e6eef8] px-5 py-2.5 text-xs font-bold text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] transition-all hover:shadow-[2px_2px_4px_#c3cad3,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
          >
            <RefreshCw size={14} />
            Réessayer la commande
          </Link>
        </div>
      )}

      {!isPaid && !isFailed && (
        <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed">
          {pollCount >= MAX_POLLS
            ? "La vérification prend plus de temps que prévu. Vous recevrez une confirmation dès validation de l'opérateur."
            : "Si vous venez d'effectuer le paiement sur votre téléphone, la confirmation peut prendre quelques instants..."}
        </p>
      )}
    </div>
  );
}
