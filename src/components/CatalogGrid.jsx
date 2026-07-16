// src/components/CatalogGrid.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Reveal } from "@/components/motion/Reveal";
import { ZigzagDivider } from "@/components/ZigzagDivider";
import { useCatalogFilters } from "@/lib/uiStore";

async function fetchProducts(params) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const res = await fetch(`/api/products?${query.toString()}`);
  if (!res.ok) throw new Error("Impossible de charger le catalogue");
  return res.json();
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-800/10 bg-white">
      <div className="aspect-square animate-pulse bg-offwhite-200" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-4/5 animate-pulse rounded bg-offwhite-200" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-offwhite-200" />
        <div className="mt-2 h-8 w-full animate-pulse rounded-lg bg-offwhite-200" />
      </div>
    </div>
  );
}

// type fixe = MOTO | TRICYCLE | PIECE selon la page qui monte ce composant.
export function CatalogGrid({ type, title, categories = [] }) {
  const { categorySlug, search, sort, setType, reset } = useCatalogFilters();

  useEffect(() => {
    setType(type);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", type, categorySlug, search, sort],
    queryFn: () => fetchProducts({ type, category: categorySlug, search, sort }),
  });

  return (
    <>
      <div className="bg-navy-900 py-10 text-white">
        <Reveal className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-white/60">Filtrez par categorie ou modele compatible</p>
        </Reveal>
      </div>

      <ZigzagDivider color="var(--color-navy-900)" flip />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <FilterDrawer categories={categories} />

          <select
            value={sort}
            onChange={(e) => useCatalogFilters.getState().setSort(e.target.value)}
            className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="recent">Plus recent</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix decroissant</option>
          </select>
        </div>

        {error && <p className="text-danger">Erreur de chargement, reessayez.</p>}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && data?.products?.length === 0 && (
          <p className="text-navy-800/60">Aucun produit ne correspond a votre recherche.</p>
        )}

        {!isLoading && data?.products?.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.products.map((product, i) => (
              <Reveal key={product.id} delay={Math.min((i % 4) * 0.05, 0.15)}>
                <ProductCard
                  product={{
                    ...product,
                    price: Number(product.price),
                    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                    image: product.images?.[0]?.url || "/placeholder-product.jpg",
                  }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}