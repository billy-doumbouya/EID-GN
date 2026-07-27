// src/app/(admin)/admin/commandes/StatusControl.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUS_CONFIG = {
  EN_ATTENTE: { label: "En attente", style: "bg-amber-500/10 text-amber-500" },
  PAYEE: { label: "Payee", style: "bg-success/10 text-success" },
  EN_PREPARATION: {
    label: "En preparation",
    style: "bg-mechanic-500/10 text-mechanic-500",
  },
  EXPEDIEE: {
    label: "Expediee",
    style: "bg-mechanic-500/10 text-mechanic-500",
  },
  LIVREE: { label: "Livree", style: "bg-success/10 text-success" },
  ANNULEE: { label: "Annulee", style: "bg-danger/10 text-danger" },
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
  EN_ATTENTE: [],
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
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.style}`}
      >
        {config.label}
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
      toast.error("Erreur reseau, reessayez");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={updating}
      className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium outline-none disabled:opacity-50 ${config.style}`}
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
