"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, Package } from "lucide-react";

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={null}>
      <OrderTrackingForm />
    </Suspense>
  );
}

function OrderTrackingForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || "",
  );
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la recherche");
        return;
      }

      setResult(data);
    } catch {
      setError("Erreur reseau, reessaie dans un instant");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center font-display text-2xl font-semibold text-navy-900">
        Suivre ma commande
      </h1>
      <p className="mt-2 text-center text-sm text-navy-800/60">
        Entre ton numero de commande et ton numero de telephone pour voir l'etat
        de ta livraison, sans avoir besoin de creer un compte.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Numero de commande (ex: CMD-2026-KANKAN-01457)"
          required
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm outline-none focus-visible:border-mechanic-500"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numero de telephone utilise pour la commande"
          required
          className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm outline-none focus-visible:border-mechanic-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-mechanic-500 py-2.5 text-sm font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          Rechercher
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-3 text-center text-sm text-danger">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-navy-800/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-mechanic-500/10 p-2.5">
              <Package size={20} className="text-mechanic-500" />
            </div>
            <div>
              <p className="font-medium text-navy-900">{result.orderNumber}</p>
              <p className="text-sm text-navy-800/60">{result.statusLabel}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1 border-t border-navy-800/10 pt-3 text-sm text-navy-800/70">
            {result.items.map((item, i) => (
              <p key={i}>
                {item.quantity} x {item.productName}
              </p>
            ))}
          </div>
          <p className="mt-3 font-semibold text-navy-900">
            {result.total.toLocaleString("fr-FR")} GNF
          </p>
        </div>
      )}
    </div>
  );
}
