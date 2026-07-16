// src/components/FilterDrawer.jsx
"use client";

import { Drawer } from "vaul";
import { SlidersHorizontal, X } from "lucide-react";
import { useCatalogFilters } from "@/lib/uiStore";

export function FilterDrawer({ categories = [] }) {
  const { categorySlug, search, setCategory, setSearch } = useCatalogFilters();

  return (
    <Drawer.Root>
      <Drawer.Trigger className="flex items-center gap-2 rounded-lg border border-navy-800/15 bg-white px-4 py-2 text-sm font-medium text-navy-900 md:hidden">
        <SlidersHorizontal size={16} />
        Filtrer
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-navy-900/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-navy-800/15" />

          <div className="flex items-center justify-between px-6 py-4">
            <Drawer.Title className="font-display text-lg font-semibold text-navy-900">
              Filtrer
            </Drawer.Title>
            <Drawer.Close className="text-navy-800/50">
              <X size={20} />
            </Drawer.Close>
          </div>

          <div className="overflow-y-auto px-6 pb-8">
            <label className="text-xs font-medium uppercase tracking-wide text-navy-800/50">
              Recherche
            </label>
            <input
              type="text"
              defaultValue={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, reference, modele compatible..."
              className="mt-2 w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm outline-none focus-visible:border-mechanic-500"
            />

            {categories.length > 0 && (
              <>
                <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-navy-800/50">
                  Categorie
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategory(null)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      !categorySlug
                        ? "bg-navy-900 text-white"
                        : "bg-offwhite-200 text-navy-800"
                    }`}
                  >
                    Toutes
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(cat.slug)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        categorySlug === cat.slug
                          ? "bg-navy-900 text-white"
                          : "bg-offwhite-200 text-navy-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Drawer.Close className="mt-6 w-full rounded-lg bg-mechanic-500 py-3 text-sm font-medium text-white">
              Voir les resultats
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}