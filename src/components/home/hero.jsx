import Image from "next/image";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-navy-950 text-white">
      {/* Fond mesh gradient anime (GPU-only via CSS) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mesh-gradient opacity-60"
      />

      {/* Image hero LCP prioritaire */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/hero-image.jpg"
          alt="Motos et tricycles EID-MULTISERVICE Haute-Guinée"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center hero-parallax"
        />
        {/* Overlay progressif premium BMW Motorrad / Linear */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40" />
      </div>

      {/* Grille filigrane blueprint technique */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40"
      />

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Badge réassurance localisation */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mechanic-500/15 border border-mechanic-500/30 text-mechanic-400 text-xs md:text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-mechanic-400 shrink-0" />
            <span>Livraison Kankan &amp; Haute-Guinée</span>
          </div>

          {/* Titre Display percutant */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
            Motos, tricycles &amp; pièces{" "}
            <span className="text-mechanic-400">au meilleur prix</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-offwhite-100/80 mb-10 max-w-xl font-normal leading-relaxed">
            Le spécialiste de la mobilité en Haute-Guinée. Stock certifié,
            compatibilité vérifiée, paiement Orange Money &amp; MTN, livraison rapide.
          </p>

          {/* Groupe de CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <Link
              href="/catalogue"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              <span>Explorer le catalogue</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/catalogue?type=MOTO&promo=1"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold backdrop-blur-sm transition-colors duration-200 text-base"
            >
              Promotions en cours
            </Link>
          </div>
        </div>
      </div>

      {/* Indicateur de scroll CSS */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <span className="w-1.5 h-2 bg-mechanic-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
