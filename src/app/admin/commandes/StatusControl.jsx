// src/app/(admin)/admin/commandes/StatusControl.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUS_CONFIG = {
  EN_ATTENTE: { label: "En attente", style: "bg-black text-amber-500 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" },
  PAYEE: { label: "Payée", style: "bg-black text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" },
  EN_PREPARATION: {
    label: "En préparation",
    style: "bg-black text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
  },
  EXPEDIEE: {
    label: "Expédiée",
    style: "bg-black text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]",
  },
  LIVREE: { label: "Livrée", style: "bg-black text-emerald-500 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
  ANNULEE: { label: "Annulée", style: "bg-black text-rose-500 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]" },
};

// Doit rester identique a ALLOWED_TRANSITIONS cote serveur (route.js) —
// duplique ici uniquement pour piloter l'affichage du menu, le serveur
// reste la seule source de verite qui valide reellement la transition.
const ALLOWED_TRANSITIONS = {
  PAYEE: ["EN_PREPARATION", "ANNULEE"],
  EN_PREPARATION: ["EXPEDIEE", "ANNULEE"],
  EXPEDIEE: ["LIVREE"],
  LIVREE: [],
  ANNULEE: [],
  EN_ATTENTE: ["PAYEE", "ANNULEE"],
};

export function StatusControl({ orderNumber, status }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const config = STATUS_CONFIG[status] || {
    label: status,
    style: "bg-navy-800/10 text-navy-800/60",
  };
  const options = ALLOWED_TRANSITIONS[status] || [];

  if (options.length === 0) {
    return (
      <span
        className={`rounded-none px-2 py-1 text-[10px] font-mono tracking-wider ${config.style}`}
      >
        [{config.label}]
      </span>
    );
  }

  async function handleChange(e) {
    const nextStatus = e.target.value;
    if (!nextStatus || nextStatus === status) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Impossible de changer le statut");
        return;
      }

      toast.success(
        `Commande ${orderNumber} : ${STATUS_CONFIG[nextStatus]?.label}`,
      );
      router.refresh();
    } catch {
      toast.error("Erreur réseau, réessayez");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={updating}
      className={`rounded-none px-2 py-1 text-[10px] font-mono tracking-wider outline-none disabled:opacity-50 appearance-none bg-black cursor-pointer ${config.style}`}
    >
      <option value={status}>{config.label}</option>
      {options.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  );
}
