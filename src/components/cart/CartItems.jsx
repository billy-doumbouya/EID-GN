"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, AlertTriangle, Package } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useOptimisticCart } from "@/hooks/useOptimisticCart";

export function CartItems({ items, quote }) {
  const { updateQuantity, removeItem } = useCartStore();
  const { pendingUpdate, optimisticUpdate } = useOptimisticCart();

  const linesByProductId = new Map(
    (quote?.lines ?? []).map((l) => [l.productId, l])
  );
  const unavailableByProductId = new Map(
    (quote?.unavailable ?? []).map((u) => [u.productId, u])
  );

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map((item) => {
          const line = linesByProductId.get(item.productId);
          const unavailable = unavailableByProductId.get(item.productId);
          const imageUrl = line?.image || item.image;
          const maxStock = line?.availableStock ?? 99;
          const currentQty = optimisticUpdate[item.productId] ?? item.quantity;

          return (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-2xl border p-4 transition-colors ${
                unavailable
                  ? "border-amber-500/30 bg-amber-500/[0.03]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              } backdrop-blur-xl`}
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <Link
                  href={`/products/${line?.slug || ""}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-navy-800"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={line?.name || item.name || "Produit"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-offwhite-100/20">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </Link>

                {/* Infos produit */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${line?.slug || ""}`}
                    className="block text-sm font-semibold text-white truncate hover:text-mechanic-400 transition-colors"
                  >
                    {line?.name || item.name}
                  </Link>

                  {line && (
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-base font-bold text-mechanic-400">
                        {line.unitPrice.toLocaleString("fr-FR")} GNF
                      </span>
                      {line.discountName && (
                        <span className="text-xs text-offwhite-100/40 line-through">
                          {line.originalPrice.toLocaleString("fr-FR")} GNF
                        </span>
                      )}
                      {line.isGrosPricing && (
                        <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          Tarif gros
                        </span>
                      )}
                    </div>
                  )}

                  {unavailable && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      {unavailable.reason}
                    </p>
                  )}

                  {currentQty > maxStock && !unavailable && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Stock maximum : {maxStock}
                    </p>
                  )}
                </div>

                {/* Contrôle quantité — touch targets 44px */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.productId, currentQty - 1)}
                    disabled={currentQty <= 1 || pendingUpdate[item.productId]}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-offwhite-100/80 hover:border-mechanic-500/40 hover:text-mechanic-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    aria-label={`Diminuer la quantité de ${line?.name || "produit"}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-10 text-center font-mono text-base font-bold text-white tabular-nums">
                    {currentQty}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.productId, currentQty + 1)}
                    disabled={currentQty >= maxStock || pendingUpdate[item.productId]}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-offwhite-100/80 hover:border-mechanic-500/40 hover:text-mechanic-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    aria-label={`Augmenter la quantité de ${line?.name || "produit"}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-offwhite-100/60 hover:border-rose-500/40 hover:text-rose-400 active:scale-95 transition-all ml-1 cursor-pointer"
                    aria-label={`Retirer ${line?.name || "produit"} du panier`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Ligne total ligne */}
              {line && (
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-offwhite-100/50">
                  <span>Sous-total ligne</span>
                  <span className="font-semibold text-white tabular-nums">
                    {(line.unitPrice * currentQty).toLocaleString("fr-FR")} GNF
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
