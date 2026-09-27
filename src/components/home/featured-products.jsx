import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getFeaturedProducts } from "@/lib/queries/products";
import { ProductCard } from "@/components/catalogue/product-card";
import { ProductGridSkeleton } from "@/components/catalogue/skeletons";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(8);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-offwhite-100 border-t border-navy-900/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-mechanic-500 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Directement importés &amp; vérifiés</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
              Arrivages &amp; Nouveautés
            </h2>
          </div>

          <Link
            href="/catalogue"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-mechanic-500 transition-colors"
          >
            <span>Voir toutes les pièces et motos</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grille responsive 2 colonnes mobile, 4 colonnes desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="py-16 md:py-20 bg-offwhite-100 border-t border-navy-900/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="h-5 w-44 bg-navy-900/10 rounded animate-pulse mb-3" />
        <div className="h-10 w-72 bg-navy-900/10 rounded animate-pulse mb-10" />
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
