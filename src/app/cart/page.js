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
  ShoppingBag,
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
  },
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

  /* PANIER VIDE NEUMORPHIQUE */
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#e6eef8] flex items-center justify-center px-4 py-12 text-slate-700">
        <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 text-center shadow-[20px_20px_60px_#c3cad3,-20px_-20px_60px_#ffffff] space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6eef8] text-slate-400 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff]">
            <ShoppingBag size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-800">
              Votre panier est vide
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Découvrez nos articles et ajoutez-les à votre panier.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#e6eef8] py-3.5 text-xs font-bold text-mechanic-500 transition-all duration-200 shadow-[6px_6px_12px_#c3cad3,-6px_-6px_12px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]"
          >
            Parcourir le catalogue
          </Link>
        </div>
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
    <div className="min-h-screen bg-[#e6eef8] py-10 px-4 md:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 font-display text-2xl font-bold text-slate-800">
          Mon panier
        </h1>

        {error && (
          <div className="mb-6 rounded-2xl bg-[#e6eef8] p-4 text-xs font-semibold text-rose-500 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* SKELETON LOADING */}
        {showSkeleton ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 rounded-2xl bg-[#e6eef8] p-4 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]"
              >
                <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-[#d5deea]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#d5deea]" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-[#d5deea]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LISTE DES ARTICLES */
          <div className="space-y-4">
            {items.map((item) => {
              const line = linesByProductId.get(item.productId);
              const unavailable = unavailableByProductId.get(item.productId);
              const imageUrl = line?.image || item.image;

              return (
                <div
                  key={item.productId}
                  className={`flex items-center gap-4 rounded-2xl bg-[#e6eef8] p-4 transition-all ${
                    unavailable
                      ? "shadow-[inset_4px_4px_8px_#e5cfb3,inset_-4px_-4px_8px_#ffffff]"
                      : "shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]"
                  }`}
                >
                  {/* IMAGE AVEC EFFET CREUSÉ */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e6eef8] shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={line?.name || item.name || "Produit"}
                        fill
                        className="object-cover p-1 rounded-xl"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  {/* INFO PRODUIT */}
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">
                      {line?.name || item.name}
                    </p>

                    {line && (
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <p className="text-xs font-bold text-mechanic-500">
                          {line.unitPrice.toLocaleString("fr-FR")} GNF
                        </p>
                        {line.discountName && (
                          <p className="text-[11px] text-slate-400 line-through font-medium">
                            {line.originalPrice.toLocaleString("fr-FR")} GNF
                          </p>
                        )}
                        {line.isGrosPricing && (
                          <span className="rounded-lg bg-[#e6eef8] px-2 py-0.5 text-[10px] font-bold text-emerald-600 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
                            Tarif gros
                          </span>
                        )}
                      </div>
                    )}

                    {unavailable && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <AlertTriangle size={12} />
                        {unavailable.reason}
                      </p>
                    )}
                  </div>

                  {/* CONTRÔLE QUANTITÉ NEUMORPHIQUE */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-600 shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] hover:text-mechanic-500 active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] disabled:opacity-40 disabled:pointer-events-none transition-all"
                      disabled={item.quantity <= 1}
                      aria-label="Diminuer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-600 shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] hover:text-mechanic-500 active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] transition-all"
                      aria-label="Augmenter"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* SUPPRESSION */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6eef8] text-slate-400 shadow-[3px_3px_6px_#c3cad3,-3px_-3px_6px_#ffffff] hover:text-rose-500 active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff] transition-all ml-1"
                    aria-label="Retirer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* SOUS-TOTAL EN RELIEF */}
        <div className="mt-8 flex items-center justify-between rounded-2xl bg-[#e6eef8] p-5 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Sous-total
          </span>
          <span className="flex items-center gap-2 text-lg font-bold text-mechanic-500">
            {loading && quote && (
              <Loader size={16} className="animate-spin text-mechanic-500" />
            )}
            {(quote?.subtotal ?? 0).toLocaleString("fr-FR")} GNF
          </span>
        </div>

        {quote?.unavailable?.length > 0 && (
          <p className="mt-3 text-xs font-medium text-amber-600 px-1">
            Certains articles ne sont pas inclus dans le sous-total — ajustez ou
            retirez-les ci-dessus pour continuer.
          </p>
        )}

        {/* BOUTON PASSER COMMANDE */}
        <Link
          href="/checkout"
          aria-disabled={loading || quote?.unavailable?.length > 0}
          className={`mt-6 block w-full rounded-2xl bg-[#e6eef8] py-4 text-center text-xs font-bold text-mechanic-500 transition-all duration-200 shadow-[8px_8px_16px_#c3cad3,-8px_-8px_16px_#ffffff] hover:text-mechanic-600 hover:shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff] ${
            loading || quote?.unavailable?.length > 0
              ? "pointer-events-none opacity-50"
              : ""
          }`}
        >
          Passer commande
        </Link>

        {/* BLOC DES MOYENS DE PAIEMENT NEUMORPHIQUE */}
        <div className="mt-8 rounded-3xl bg-[#e6eef8] p-6 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff] space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span>Paiement 100% sécurisé</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="flex h-14 items-center justify-center rounded-2xl bg-[#e6eef8] p-2 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] sm:h-16 transition-all"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={method.logoUrl}
                    alt={method.label}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* PAIEMENT À LA LIVRAISON */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-[#e6eef8] py-3 text-xs font-semibold text-slate-600 shadow-[inset_3px_3px_6px_#c3cad3,inset_-3px_-3px_6px_#ffffff]">
            <Banknote size={16} className="text-emerald-500" />
            <span>Paiement en espèces à la livraison disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
