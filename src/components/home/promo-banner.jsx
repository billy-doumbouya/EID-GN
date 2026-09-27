import Link from "next/link";
import { ArrowRight, Tag, Percent } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-12 md:py-16 bg-offwhite-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
          {/* Arrière-plan décoratif abstrait blueprint */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-mechanic-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-1/4 top-0 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-grid-faint opacity-30"
          />

          <div className="relative z-10 max-w-2xl">
            {/* Tag promo */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mechanic-500/20 border border-mechanic-500/30 text-mechanic-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Percent className="w-3.5 h-3.5" />
              <span>Tarif Grossiste &amp; Revendeur</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Vous êtes revendeur ou garagiste en{" "}
              <span className="text-mechanic-400">Haute-Guinée</span> ?
            </h2>

            <p className="text-base sm:text-lg text-offwhite-100/80 mb-8 font-normal leading-relaxed">
              Bénéficiez de réductions dégressives dès 5 unités achetées sur l’ensemble
              des pièces détachées et consommables. Facturation avec RCCM et expédition
              groupée sous 24h.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalogue?promo=1"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02] active:scale-[0.98]"
              >
                <Tag className="w-4 h-4" />
                <span>Voir les offres en cours</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://wa.me/224624151415?text=Bonjour,%20je%20souhaite%20obtenir%20des%20informations%20sur%20les%20tarifs%20de%20gros"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold backdrop-blur-sm transition-colors duration-200"
              >
                Contacter le service commercial
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
