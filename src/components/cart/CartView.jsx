"use client";

import { useCartStore } from "@/lib/cartStore";
import { useCartQuote } from "@/hooks/useCartQuote";
import { CartEmpty } from "./CartEmpty";
import { CartItems } from "./CartItems";
import { CartSummary } from "./CartSummary";
import { CartSkeleton } from "./CartSkeleton";
import { AlertTriangle } from "lucide-react";

export function CartView() {
  const { items } = useCartStore();

  // TanStack Query : cache + retry + dedup automatiques
  const { data: quote, isLoading, isError, error } = useCartQuote(items);

  if (items.length === 0) {
    return <CartEmpty />;
  }

  if (isError) {
    return (
      <main className="min-h-[70vh] bg-navy-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-xl p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400 mb-4" />
          <p className="text-rose-200 font-medium">
            Impossible de calculer votre panier
          </p>
          <p className="mt-2 text-sm text-rose-200/60">
            {error?.message || "Vérifiez votre connexion et réessayez."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy-950 text-offwhite-100 py-10 px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            Mon panier
          </h1>
          <p className="mt-1 text-sm text-offwhite-100/50">
            {items.length} article{items.length > 1 ? "s" : ""} · Stock vérifié
            en temps réel
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Colonne gauche : items */}
          <div>
            {isLoading ? (
              <CartSkeleton count={items.length} />
            ) : (
              <CartItems items={items} quote={quote} />
            )}
          </div>

          {/* Colonne droite : summary sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary quote={quote} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  );
}
