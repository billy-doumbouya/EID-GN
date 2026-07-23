"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, Loader, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();

  const [quote, setQuote] = useState(null); // { lines, subtotal, unavailable }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cle stable derivee des items pour ne redeclencher le fetch que quand
  // productId/quantity changent reellement (le store recree un nouveau
  // tableau a chaque set(), une dependance directe sur `items` boucler ait).
  const itemsKey = items.map((i) => `${i.productId}:${i.quantity}`).join(",");

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch("/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de calculer le panier");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setQuote(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Une erreur est survenue.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-navy-800/60">Votre panier est vide.</p>
        <Link
          href="/"
          className="mt-3 inline-block text-mechanic-500 hover:underline"
        >
          Parcourir le catalogue
        </Link>
      </div>
    );
  }

  const linesByProductId = new Map(
    (quote?.lines ?? []).map((l) => [l.productId, l]),
  );
  const unavailableByProductId = new Map(
    (quote?.unavailable ?? []).map((u) => [u.productId, u]),
  );
  const showSkeleton = loading && !quote;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy-900">
        Mon panier
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {showSkeleton ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-xl border border-navy-800/10 bg-white p-3"
            >
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-offwhite-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-offwhite-200" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-offwhite-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const line = linesByProductId.get(item.productId);
            const unavailable = unavailableByProductId.get(item.productId);

            return (
              <div
                key={item.productId}
                className={`flex items-center gap-4 rounded-xl border bg-white p-3 ${
                  unavailable
                    ? "border-amber-400/50 bg-amber-50/40"
                    : "border-navy-800/10"
                }`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-offwhite-200">
                  {/* line.image en priorite (frais), sinon item.image mis en
                      cache dans le store au moment de l'ajout au panier. */}
                  {(line?.image || item.image) && (
                    <Image
                      src={line?.image || item.image}
                      alt={line?.name || item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">
                    {line?.name || item.name}
                  </p>

                  {line && (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm text-mechanic-500">
                        {line.unitPrice.toLocaleString("fr-FR")} GNF
                      </p>
                      {line.discountName && (
                        <p className="text-xs text-navy-800/40 line-through">
                          {line.originalPrice.toLocaleString("fr-FR")} GNF
                        </p>
                      )}
                      {line.isGrosPricing && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                          Tarif gros
                        </span>
                      )}
                    </div>
                  )}

                  {unavailable && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle size={12} />
                      {unavailable.reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="rounded-full border border-navy-800/15 p-1 hover:bg-offwhite-200 disabled:opacity-30"
                    disabled={item.quantity <= 1}
                    aria-label="Diminuer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="rounded-full border border-navy-800/15 p-1 hover:bg-offwhite-200"
                    aria-label="Augmenter"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-navy-800/40 hover:text-danger"
                  aria-label="Retirer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl bg-navy-900 p-4 text-white">
        <span className="font-medium">Sous-total</span>
        <span className="flex items-center gap-2 text-lg font-semibold text-mechanic-400">
          {loading && quote && <Loader size={16} className="animate-spin" />}
          {(quote?.subtotal ?? 0).toLocaleString("fr-FR")} GNF
        </span>
      </div>

      {quote?.unavailable?.length > 0 && (
        <p className="mt-2 text-xs text-amber-600">
          Certains articles ne sont pas inclus dans le sous-total — ajustez ou
          retirez-les ci-dessus pour continuer.
        </p>
      )}

      <Link
        href="/checkout"
        aria-disabled={loading || quote?.unavailable?.length > 0}
        className={`mt-4 block rounded-lg py-3 text-center font-medium text-white ${
          loading || quote?.unavailable?.length > 0
            ? "pointer-events-none bg-mechanic-500/50"
            : "bg-mechanic-500 hover:bg-mechanic-600"
        }`}
      >
        Passer commande
      </Link>
    </div>
  );
}
