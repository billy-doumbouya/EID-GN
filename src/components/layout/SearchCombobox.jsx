"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, X, ArrowRight, Package } from "lucide-react";

async function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2)
    return { products: [], pagination: { total: 0 } };
  const res = await fetch(
    `/api/products?search=${encodeURIComponent(searchTerm.trim())}&limit=8`
  );
  if (!res.ok) throw new Error("Erreur recherche");
  return res.json();
}

export function SearchCombobox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = aucun, 0+ = item actif

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Recherche
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["live-search", debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const products = searchResults?.products || [];
  const totalResults = searchResults?.pagination?.total || 0;
  const showResults = isOpen && debouncedQuery.trim().length >= 2;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset activeIndex when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/pieces?search=${encodeURIComponent(query.trim())}`);
  };

  const selectProduct = useCallback(
    (product) => {
      setIsOpen(false);
      setQuery("");
      router.push(`/produit/${product.slug}`);
    },
    [router]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || products.length === 0) {
      if (e.key === "Escape") setIsOpen(false);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, products.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        if (activeIndex >= 0 && products[activeIndex]) {
          e.preventDefault();
          selectProduct(products[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex];
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const comboboxId = "navbar-search";

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={comboboxId} className="sr-only">
          Rechercher un produit
        </label>

        <div className="relative">
          <span
            aria-hidden
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-offwhite-100/40 pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-mechanic-400" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </span>

          <input
            ref={inputRef}
            id={comboboxId}
            type="search"
            role="combobox"
            aria-expanded={showResults}
            aria-controls={`${comboboxId}-listbox`}
            aria-activedescendant={
              activeIndex >= 0 ? `${comboboxId}-option-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une pièce, moto..."
            className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-offwhite-100/40 outline-none transition-all focus:bg-white/10 focus:border-mechanic-500/50 focus:ring-2 focus:ring-mechanic-500/20"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-offwhite-100/40 hover:text-white"
              aria-label="Effacer la recherche"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown résultats */}
      {showResults && (
        <div
          id={`${comboboxId}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 backdrop-blur-xl shadow-2xl z-50"
        >
          {isLoading && (
            <div className="p-6 text-center text-sm text-offwhite-100/50">
              Recherche en cours…
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-offwhite-100/20 mb-2" />
              <p className="text-sm text-offwhite-100/60">
                Aucun résultat pour « {debouncedQuery} »
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-3 text-xs text-mechanic-400 hover:text-mechanic-300"
              >
                Voir tout le catalogue →
              </button>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <>
              <ul ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
                {products.map((product, index) => (
                  <li
                    key={product.id}
                    id={`${comboboxId}-option-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                  >
                    <button
                      type="button"
                      onClick={() => selectProduct(product)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center gap-3 w-full rounded-lg p-2 text-left transition-colors ${
                        activeIndex === index
                          ? "bg-mechanic-500/10 border border-mechanic-500/30"
                          : "border border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-navy-800">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-offwhite-100/20">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {product.name}
                        </p>
                        <p className="font-mono text-[11px] text-offwhite-100/40">
                          {product.sku}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-sm font-bold text-mechanic-400">
                        {product.priceDetail?.toLocaleString("fr-FR")} GNF
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Footer "Voir tous les résultats" */}
              {totalResults > products.length && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 border-t border-white/5 bg-white/[0.02] py-3 text-sm font-medium text-offwhite-100/70 hover:text-mechanic-400 hover:bg-white/[0.04] transition-colors"
                >
                  Voir les {totalResults} résultats
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
