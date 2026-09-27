import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function CartEmpty() {
  return (
    <main className="min-h-[70vh] bg-navy-950 flex items-center justify-center px-4 py-12">
      {/* Mesh gradient subtil */}
      <div
        aria-hidden
        className="absolute inset-0 mesh-gradient-warm opacity-30 pointer-events-none"
      />

      <div className="relative max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400">
          <ShoppingBag className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">
            Votre panier est vide
          </h1>
          <p className="text-sm text-offwhite-100/60 leading-relaxed">
            Découvrez nos motos, tricycles et pièces détachées. Stock réel,
            paiement mobile money, livraison rapide en Haute-Guinée.
          </p>
        </div>

        <Link
          href="/motos"
          className="group inline-flex items-center justify-center gap-2 w-full rounded-xl bg-mechanic-500 hover:bg-mechanic-400 px-6 py-3.5 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02]"
        >
          Parcourir le catalogue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/promotions"
          className="block text-sm text-mechanic-400 hover:text-mechanic-300 transition-colors"
        >
          ou voir les promotions en cours →
        </Link>
      </div>
    </main>
  );
}
