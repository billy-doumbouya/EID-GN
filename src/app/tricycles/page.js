// src/app/(shop)/tricycles/page.js
import { Suspense } from "react";
import { CatalogGrid } from "@/components/CatalogGrid";
import { getCategoriesByType } from "@/lib/queries/categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tricycles | EID-GN" };

export default async function TricyclesPage() {
  const categories = await getCategoriesByType("TRICYCLE");

  return (
    <Suspense fallback={<TricyclesSkeleton />}>
      <CatalogGrid type="TRICYCLE" title="Tricycles" categories={categories} />
    </Suspense>
  );
}

function TricyclesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-offwhite-200 mb-6" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-navy-800/10 bg-white"
          >
            <div className="aspect-square animate-pulse bg-offwhite-200" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-4/5 animate-pulse rounded bg-offwhite-200" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-offwhite-200" />
              <div className="mt-2 h-8 w-full animate-pulse rounded-lg bg-offwhite-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
