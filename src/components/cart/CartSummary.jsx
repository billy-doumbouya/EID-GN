"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";
import { Tag, ArrowRight, Loader2, ShieldCheck, Truck, Check } from "lucide-react";

export function CartSummary({ quote, isLoading }) {
  const { items } = useCartStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const hasUnavailable = (quote?.unavailable?.length ?? 0) > 0;
  const canCheckout = !isLoading && !hasUnavailable && items.length > 0;

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoError("");
    setValidatingPromo(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");

      setPromoApplied(true);
    } catch (err) {
      setPromoError(err.message);
      setPromoApplied(false);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleCheckout = () => {
    if (!canCheckout) return;
    router.push("/checkout");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
      {/* Titre */}
      <h2 className="font-display text-lg font-bold text-white">
        Récapitulatif
      </h2>

      {/* Code promo */}
      {promoApplied ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" />
            Code "{promoCode}" appliqué
          </span>
          <button
            onClick={() => {
              setPromoApplied(false);
              setPromoCode("");
            }}
            className="text-xs text-emerald-300/60 hover:text-emerald-300 cursor-pointer"
          >
            Retirer
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyPromo} className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-offwhite-100/60">
            <Tag className="h-3.5 w-3.5" />
            Code promo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Ex: TABASKI2026"
              className="flex-1 rounded-xl border border-white/10 bg-navy-950/50 px-3 py-2.5 text-sm text-white placeholder:text-offwhite-100/30 focus:outline-none focus:border-mechanic-500/50"
            />
            <button
              type="submit"
              disabled={validatingPromo}
              className="px-4 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {validatingPromo ? "..." : "Appliquer"}
            </button>
          </div>
          {promoError && (
            <p className="text-xs text-rose-400">{promoError}</p>
          )}
        </form>
      )}

      {/* Détail des totaux */}
      <div className="space-y-2.5 pt-4 border-t border-white/5">
        <Row
          label={`Sous-total (${items.length} art.)`}
          value={`${(quote?.subtotal ?? 0).toLocaleString("fr-FR")} GNF`}
          loading={isLoading}
        />
        {quote?.discount > 0 && (
          <Row
            label="Réduction"
            value={`−${quote.discount.toLocaleString("fr-FR")} GNF`}
            valueClass="text-emerald-400"
            loading={isLoading}
          />
        )}
        <Row
          label="Livraison"
          value={
            quote?.deliveryFee === 0
              ? "Offerte"
              : `${(quote?.deliveryFee ?? 0).toLocaleString("fr-FR")} GNF`
          }
          valueClass={quote?.deliveryFee === 0 ? "text-emerald-400" : ""}
          loading={isLoading}
        />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-sm font-semibold text-offwhite-100/80">
          Total
        </span>
        <span className="font-display text-2xl font-bold text-mechanic-400 tabular-nums">
          {(quote?.total ?? 0).toLocaleString("fr-FR")} GNF
        </span>
      </div>

      {/* CTA checkout */}
      <button
        onClick={handleCheckout}
        disabled={!canCheckout}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 disabled:bg-white/5 disabled:text-offwhite-100/30 px-6 py-4 text-white font-semibold transition-all duration-200 shadow-glow-mechanic disabled:shadow-none hover:scale-[1.02] disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Calcul en cours…
          </>
        ) : hasUnavailable ? (
          "Corrigez votre panier"
        ) : (
          <>
            Passer commande
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      {/* Trust badges compacts */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <TrustBadge
          icon={ShieldCheck}
          text="Paiement mobile money sécurisé"
        />
        <TrustBadge
          icon={Truck}
          text="Livraison Kankan 24-48h · Autres régions 48-72h"
        />
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "", loading }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-offwhite-100/60">{label}</span>
      <span
        className={`font-medium text-white tabular-nums ${valueClass} ${
          loading ? "opacity-50" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TrustBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-offwhite-100/50">
      <Icon className="h-3.5 w-3.5 text-mechanic-400/60" />
      {text}
    </div>
  );
}
