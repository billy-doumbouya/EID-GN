"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Reveal } from "@/components/motion/Reveal";
import { ZigzagDivider } from "@/components/ZigzagDivider";
import { useCatalogFilters } from "@/lib/uiStore";
import { useSearchParams } from "next/navigation";
import { PackageSearch, RotateCcw } from "lucide-react";

async function fetchProducts(params) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  );
  const res = await fetch(`/api/products?${query.toString()}`);
  if (!res.ok) throw new Error("Impossible de charger le catalogue");
  return res.json();
}

async function fetchFavoriteIds() {
  const res = await fetch("/api/favorites/ids");
  if (!res.ok) return { productIds: [] };
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

export function CatalogGrid({ type, title, categories = [] }) {
  const searchParams = useSearchParams();
  const { categorySlug, search, sort, setType, reset, setSearch } =
    useCatalogFilters();
  const querySearch = searchParams.get("search");

  useEffect(() => {
    setType(type);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (querySearch) {
      useCatalogFilters.getState().setSearch(querySearch);
    }
  }, [querySearch]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", type, categorySlug, search, sort],
    queryFn: () =>
      fetchProducts({ type, category: categorySlug, search, sort }),
  });

  const { data: favoritesData } = useQuery({
    queryKey: ["favorite-ids"],
    queryFn: fetchFavoriteIds,
    staleTime: 60_000,
  });
  const favoriteIds = new Set(favoritesData?.productIds ?? []);

  // Déterminer le terme de recherche actif (du state Zustand ou de l'URL)
  const activeSearchTerm = search || querySearch;

  return (
    <>
      <div className="bg-navy-900 py-10 text-white">
        <Reveal className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-white/60">
            Filtrez par catégorie ou modèle compatible
          </p>
        </Reveal>
      </div>

      <ZigzagDivider color="var(--color-navy-900)" flip />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <FilterDrawer categories={categories} />

          <select
            value={sort}
            onChange={(e) =>
              useCatalogFilters.getState().setSort(e.target.value)
            }
            className="rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="recent">Plus récent</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-rose-700">
            Erreur de chargement, veuillez réorganiser vos filtres ou réessayer.
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* --- ÉTAT VIDE AMÉLIORÉ --- */}
        {!isLoading && data?.products?.length === 0 && (
          <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-800/15 bg-white p-8 text-center shadow-xs md:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-offwhite-100 text-navy-800/40">
              <PackageSearch size={32} />
            </div>

            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
              Aucun résultat trouvé
            </h3>

            <p className="mt-1.5 max-w-md text-sm text-navy-800/60 leading-relaxed">
              {activeSearchTerm ? (
                <>
                  Aucune pièce ne correspond au terme de recherche{" "}
                  <span className="font-semibold text-mechanic-500">
                    « {activeSearchTerm} »
                  </span>
                  .
                </>
              ) : (
                "Aucun produit ne correspond aux filtres sélectionnés."
              )}
            </p>

            {/* Bouton pour réinitialiser la recherche */}
            {(activeSearchTerm || categorySlug) && (
              <button
                onClick={() => {
                  setSearch("");
                  reset();
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-transform active:scale-95 hover:bg-navy-800"
              >
                <RotateCcw size={14} />
                Réinitialiser la recherche
              </button>
            )}
          </div>
        )}

        {!isLoading && data?.products?.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.products.map((product, i) => (
              <Reveal key={product.id} delay={Math.min((i % 4) * 0.05, 0.15)}>
                <ProductCard
                  product={product}
                  isFavorited={favoriteIds.has(product.id)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
