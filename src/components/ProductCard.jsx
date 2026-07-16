// src/components/ProductCard.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cartStore";
import { cn } from "@/lib/utiles";

const stockLabel = cva("text-xs font-medium", {
  variants: {
    status: {
      out: "text-danger",
      low: "text-amber-500",
      in: "text-success",
    },
  },
});

const addButton = cva(
  "mt-3 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors active:scale-95",
  {
    variants: {
      status: {
        out: "cursor-not-allowed bg-navy-800/20",
        low: "bg-navy-900 hover:bg-mechanic-500",
        in: "bg-navy-900 hover:bg-mechanic-500",
      },
    },
  },
);

function getStockStatus(product) {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.lowStockAlert) return "low";
  return "in";
}

export function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const status = getStockStatus(product);
  const isOutOfStock = status === "out";

  function handleAdd() {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      1,
    );
    toast.success(`${product.name} ajoute au panier`);
  }

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-navy-800/10 bg-white",
        "transition-[transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/5",
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-offwhite-200"
      >
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.06]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
        {product.compareAtPrice && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-navy-900">
            Promo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-navy-900 line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-mechanic-500">
            {product.price.toLocaleString("fr-FR")} GNF
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-navy-800/40 line-through">
              {product.compareAtPrice.toLocaleString("fr-FR")} GNF
            </span>
          )}
        </div>

        <div className="mt-1">
          <span className={stockLabel({ status })}>
            {status === "out" && "Rupture de stock"}
            {status === "low" && `Stock limite (${product.stock})`}
            {status === "in" && "En stock"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={addButton({ status })}
        >
          {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
