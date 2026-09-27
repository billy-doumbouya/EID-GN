"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck, Truck, Tag, ShoppingBag } from "lucide-react";

export function CheckoutSummary({ quote, isLoading, isError, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
      <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
        <ShoppingBag className="h-4 w-4 text-mechanic-400" />
        Récapitulatif
      </h2>

      {/* Articles indisponibles */}
      <AnimatePresence>
        {quote?.unavailable?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3"
          >
            <p className="flex items-center gap-2 text-xs font-medium text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              {quote.unavailable.length} article(s) plus disponible(s)
            </p>
            <ul className="mt-2 space-y-1">
              {quote.unavailable.map((u) => (
                <li key={u.productId} className="text-xs text-amber-200/70">
                  · {u.reason}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des articles */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            {(items || []).slice(0, 3).map((i) => (
              <div key={i.productId} className="h-12 rounded-lg bg-navy-800 animate-pulse" />
            ))}
          </div>
        ) : (
          quote?.lines?.map((line) => (
            <div
              key={line.productId}
              className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-navy-800">
                {line.image && (
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {line.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-offwhite-100/50">
                    {line.quantity} × {line.unitPrice.toLocaleString("fr-FR")} GNF
                  </span>
                  {line.isGrosPricing && (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      Gros
                    </span>
                  )}
                  {line.discountName && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                      {line.discountName}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-white tabular-nums">
                {line.lineTotal.toLocaleString("fr-FR")} GNF
              </span>
            </div>
          ))
        )}
      </div>

      {/* Totaux */}
      <div className="space-y-2.5 pt-4 border-t border-white/10">
        <Row
          label={`Sous-total (${(items || []).length} art.)`}
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

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-sm font-semibold text-offwhite-100/80">
          Total à payer
        </span>
        <span className="font-display text-2xl font-bold text-mechanic-400 tabular-nums">
          {(quote?.total ?? 0).toLocaleString("fr-FR")} GNF
        </span>
      </div>

      {/* Trust signals */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <TrustBadge icon={ShieldCheck} text="Paiement chiffré SSL" />
        <TrustBadge icon={Truck} text="Livraison Kankan 24-48h" />
        <TrustBadge icon={Tag} text="Stock vérifié en temps réel" />
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
