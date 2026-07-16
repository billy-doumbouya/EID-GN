"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-navy-800/60">Votre panier est vide.</p>
        <Link href="/" className="mt-3 inline-block text-mechanic-500 hover:underline">
          Parcourir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold text-navy-900">Mon panier</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-xl border border-navy-800/10 bg-white p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-offwhite-200">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-navy-900">{item.name}</p>
              <p className="text-sm text-mechanic-500">{item.price.toLocaleString("fr-FR")} GNF</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="rounded-full border border-navy-800/15 p-1 hover:bg-offwhite-200"
                aria-label="Diminuer"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="rounded-full border border-navy-800/15 p-1 hover:bg-offwhite-200 disabled:opacity-30"
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
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-navy-900 p-4 text-white">
        <span className="font-medium">Sous-total</span>
        <span className="text-lg font-semibold text-mechanic-400">
          {subtotal().toLocaleString("fr-FR")} GNF
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-4 block rounded-lg bg-mechanic-500 py-3 text-center font-medium text-white hover:bg-mechanic-600"
      >
        Passer commande
      </Link>
    </div>
  );
}
