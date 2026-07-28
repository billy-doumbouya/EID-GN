"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  Loader,
  AlertTriangle,
  Package,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

 const PAYMENT_METHODS = [
  {
    id: "orange-money",
    label: "Orange Money",
    logoUrl: "/payment-logo/orange.png",
  },
  {
    id: "mobile-money",
    label: "MTN Mobile Money",
    logoUrl: "/payment-logo/mtn.png",
  },
  { id: "moov", label: "Moov Money", logoUrl: "/payment-logo/moov.png" },
  {
    id: "carte-bancaire",
    label: "Carte bancaire (Visa)",
    logoUrl: "/payment-logo/visa.png",
  },
  {
    id: "kulu",
    label: "Kulu",
    logoUrl: "/payment-logo/kulu.png",
  },
  {
    id: "soutra-money",
    label: "Soutra Money",
    logoUrl: "/payment-logo/soutra-money.png",
  },
  {
    id: "paycard",
    label: "PayCard",
    logoUrl: "/payment-logo/paycard.png",
  }
];
export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [itemsKey]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-navy-800/60">Votre panier est vide.</p>
        <Link
          href="/"
          className="mt-3 inline-block font-medium text-mechanic-500 hover:underline"
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
            const imageUrl = line?.image || item.image;

            return (
              <div
                key={item.productId}
                className={`flex items-center gap-4 rounded-xl border bg-white p-3 ${
                  unavailable
                    ? "border-amber-400/50 bg-amber-50/40"
                    : "border-navy-800/10"
                }`}
              >
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-offwhite-200">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={line?.name || item.name || "Produit"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-navy-800/20" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">
                    {line?.name || item.name}
                  </p>

                  {line && (
                    <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-semibold text-mechanic-500">
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
                  <span className="w-6 text-center text-sm font-medium">
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
                  className="p-1 text-navy-800/40 transition-colors hover:text-danger"
                  aria-label="Retirer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sous-total */}
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
        className={`mt-4 block rounded-lg py-3 text-center font-medium text-white transition-colors ${
          loading || quote?.unavailable?.length > 0
            ? "pointer-events-none bg-mechanic-500/50"
            : "bg-mechanic-500 hover:bg-mechanic-600"
        }`}
      >
        Passer commande
      </Link>

      {/* Section Logos de Paiement (assets locaux) */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-navy-800/10 bg-offwhite-100/60 px-4 py-3">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-navy-800/60">
            Paiement 100% sécurisé
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 p-4 sm:gap-3">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className="group flex h-14 items-center justify-center rounded-xl border border-navy-800/10 bg-white p-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-mechanic-500/30 hover:shadow-md sm:h-16"
            >
              <div className="relative h-full w-full">
                <Image
                  src={method.logoUrl}
                  alt={method.label}
                  fill
                  className="object-contain p-1 grayscale-0"
                  sizes="80px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Paiement à la livraison */}
        <div className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-lg bg-offwhite-100 py-2.5 text-xs font-medium text-navy-800/80">
          <Banknote size={16} className="text-emerald-600" />
          <span>Paiement en espèces à la livraison disponible</span>
        </div>
      </div>
    </div>
  );
}
