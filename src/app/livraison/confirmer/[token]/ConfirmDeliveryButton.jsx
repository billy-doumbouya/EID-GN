"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ConfirmDeliveryButton({ token, orderNumber }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/livraison/confirmer/${token}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Confirmation impossible");
        return;
      }

      setConfirmed(true);
      toast.success(`Commande ${orderNumber} marquee livree`);
    } catch {
      toast.error("Erreur reseau, reessayez");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <p className="mt-6 font-medium text-success">
        Livraison confirmee. Merci !
      </p>
    );
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="mt-6 w-full rounded-lg bg-mechanic-500 py-3 font-medium text-white hover:bg-mechanic-600 disabled:opacity-60"
    >
      {loading ? "Confirmation..." : "Confirmer la livraison"}
    </button>
  );
}
