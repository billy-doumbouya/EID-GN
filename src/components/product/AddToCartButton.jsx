"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

export function AddToCartButton({
  product: {
    id,
    name,
    slug,
    price,
    originalPrice,
    image,
    stock,
    lowStockAlert,
    isOnPromo,
    discountName,
  },
  quantity: controlledQuantity,
  onQuantityChange,
}) {
  const [internalQuantity, setInternalQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isOutOfStock = stock <= 0;
  const quantity = controlledQuantity ?? internalQuantity;
  const updateQuantity = (nextQuantity) => {
    if (onQuantityChange) {
      onQuantityChange(nextQuantity);
    } else {
      setInternalQuantity(nextQuantity);
    }
  };

  const handleIncrement = () => {
    if (quantity < stock) updateQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) updateQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        id,
        productId: id,
        name,
        slug,
        price,
        originalPrice,
        image,
        stock,
        isOnPromo,
        discountName,
      },
      quantity
    );

    setJustAdded(true);
    toast.success(
      quantity > 1
        ? `${quantity}× ${name} ajoutés au panier`
        : `${name} ajouté au panier`,
      {
        description:
          isOnPromo && discountName ? `Offre appliquée: ${discountName}` : undefined,
      }
    );

    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  if (isOutOfStock) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-semibold text-offwhite-100/40 cursor-not-allowed">
        Article indisponible
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Sélecteur de quantité */}
      <div className="flex items-center justify-between sm:justify-start rounded-xl border border-white/10 bg-white/[0.03] p-1 shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Diminuer la quantité"
        >
          <Minus size={16} />
        </button>
        <span className="w-12 text-center font-display text-base font-bold text-white tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= stock}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Augmenter la quantité"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Bouton CTA Ajouter au panier */}
      <motion.button
        type="button"
        onClick={handleAddToCart}
        whileTap={{ scale: 0.98 }}
        className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3.5 px-6 font-display text-base font-bold text-white shadow-glow-mechanic transition-all cursor-pointer ${
          justAdded
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-mechanic-500 hover:bg-mechanic-400"
        }`}
      >
        {justAdded ? (
          <>
            <Check size={18} className="animate-in zoom-in-50 duration-200" />
            <span>Ajouté au panier !</span>
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            <span>Ajouter au panier</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
