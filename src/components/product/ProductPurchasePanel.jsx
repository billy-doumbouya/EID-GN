"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, PackageCheck, AlertCircle } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";

export function ProductPurchasePanel({
  product,
  basePrice,
  finalPrice,
  customerType,
  discount,
  isOnPromo,
  availableStock,
}) {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = finalPrice * quantity;

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-baseline gap-3">
          <div>
            <span className="font-display text-4xl font-bold text-white tabular-nums">
              {Math.round(totalPrice).toLocaleString("fr-FR")}
            </span>
            <span className="ml-1.5 font-display text-lg font-bold text-mechanic-400">
              GNF
            </span>
          </div>

          {isOnPromo && (
            <span className="text-lg text-offwhite-100/40 line-through tabular-nums">
              {Math.round(basePrice * quantity).toLocaleString("fr-FR")} GNF
            </span>
          )}

          {isOnPromo && (
            <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">
              Vous économisez {Math.round(discount.savings * quantity).toLocaleString("fr-FR")} GNF
            </span>
          )}
        </div>

        {customerType === "GROS" && product.priceGros && (
          <div className="mt-3 border-t border-white/5 pt-3">
            <p className="text-xs text-offwhite-100/60">
              Tarif grossiste appliqué · Quantité min: {product.minQtyGros} unités
            </p>
          </div>
        )}

        {customerType === "DETAIL" && product.priceGros && (
          <div className="mt-3 border-t border-white/5 pt-3">
            <Link
              href="/compte/devenir-grossiste"
              className="inline-flex items-center gap-1.5 text-xs text-mechanic-400 hover:text-mechanic-300"
            >
              <Building2 className="h-3.5 w-3.5" />
              Vous êtes commerçant ? Voir le prix de gros
            </Link>
          </div>
        )}

        <div className="mt-4 border-t border-white/5 pt-4">
          {availableStock > 0 ? (
            <div className="flex items-center gap-2 text-sm">
              <PackageCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-emerald-400">
                {availableStock <= 5
                  ? `Plus que ${availableStock} en stock !`
                  : "En stock à Kankan"}
              </span>
              {product.reservedStock > 0 && (
                <span className="text-xs text-offwhite-100/40">
                  ({product.reservedStock} en cours de commande)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span className="font-medium text-rose-400">Rupture de stock</span>
              <Link href="/contact" className="text-xs text-mechanic-400 hover:text-mechanic-300">
                Me prévenir quand disponible
              </Link>
            </div>
          )}
        </div>
      </div>

      <AddToCartButton
        product={{
          ...product,
          price: finalPrice,
          originalPrice: basePrice,
          stock: availableStock,
          isOnPromo,
          discountName: discount?.name,
        }}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </>
  );
}
