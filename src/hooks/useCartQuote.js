"use client";

import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/lib/cartStore";

export function useCartQuote(items) {
  const itemsKey = (items || [])
    .map((i) => `${i.productId}:${i.quantity}`)
    .join(",");

  const query = useQuery({
    queryKey: ["cart-quote", itemsKey],
    queryFn: async () => {
      if (!items || items.length === 0) return null;

      const res = await fetch("/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Impossible de calculer le panier");
      }

      return res.json();
    },
    enabled: !!items && items.length > 0,
    staleTime: 30_000, // 30s — évite les refetch inutiles
    retry: 2,
    // Garde les données précédentes pendant le refetch (évite le flash)
    placeholderData: (prev) => prev,
  });

  return {
    ...query,
    quote: query.data,
  };
}
