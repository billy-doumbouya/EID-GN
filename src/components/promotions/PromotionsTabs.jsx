"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const TYPE_TABS = [
  { value: "ALL", label: "Tout" },
  { value: "MOTO", label: "Motos" },
  { value: "TRICYCLE", label: "Tricycles" },
  { value: "PIECE", label: "Pièces" },
];

const SORT_OPTIONS = [
  { value: "discount", label: "Meilleure remise" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "new", label: "Nouveautés" },
];

export function PromotionsTabs({ activeType, sortBy }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "ALL" && value !== "discount") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:ml-auto">
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm overflow-x-auto">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateParams({ type: tab.value })}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              activeType === tab.value
                ? "bg-mechanic-500 text-white"
                : "text-offwhite-100/60 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <label className="relative inline-flex items-center">
        <span className="sr-only">Trier par</span>
        <select
          value={sortBy}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="appearance-none pl-3.5 pr-9 py-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-sm text-white font-medium focus:outline-none focus:border-mechanic-500/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-navy-900 text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-offwhite-100/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </label>
    </div>
  );
}
