"use client";

import { toast } from "sonner";
import { useCartStore } from "@/lib/cartStore";

export function AddToCartButton({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isOutOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(product, 1);
    toast.success(`${product.name} ajoute au panier`);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className="mt-6 w-full rounded-lg bg-navy-900 py-3 font-medium text-white transition-colors hover:bg-mechanic-500 disabled:cursor-not-allowed disabled:bg-navy-800/20 md:w-auto md:px-8"
    >
      {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
    </button>
  );
}
