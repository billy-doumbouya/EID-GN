// src/lib/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store panier - accessible partout sans Provider, souscription selective.
// IMPORTANT : aucun prix n'est stocke ici. Le prix reel (gros/detail/promo)
// depend de la quantite et des promotions actives au moment de l'affichage,
// donc il est TOUJOURS recalcule via /api/cart/quote, jamais mis en cache.
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, image, quantity, stock }

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + quantity, product.stock),
                  }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                name: product.name,
                image: product.image,
                quantity,
                stock: product.stock,
              },
            ],
          });
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clear: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "moto-shop-cart" },
  ),
);
