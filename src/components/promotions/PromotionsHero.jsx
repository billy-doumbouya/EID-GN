import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function PromotionsHero({ totalOffers, maxDiscount, totalSavings }) {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Mesh gradient warm */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 mesh-gradient-warm opacity-70"
      />

      {/* Grain SVG */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Ligne mécanique supérieure */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-mechanic-500/30 bg-mechanic-500/5 backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider text-mechanic-400">
            <Zap className="w-3.5 h-3.5" />
            Offres à durée limitée
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white">
            Jusqu'à{" "}
            <span className="bg-gradient-to-r from-mechanic-400 to-amber-500 bg-clip-text text-transparent">
              −{maxDiscount}%
            </span>
            <br />
            sur tout le catalogue
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-offwhite-100/70 leading-relaxed">
            {totalOffers} offres en cours sur motos, tricycles et pièces
            détachées. Économisez jusqu'à{" "}
            <span className="font-semibold text-white">
              {Math.round(totalSavings).toLocaleString("fr-FR")} GNF
            </span>{" "}
            sur votre commande.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10">
            <Link
              href="#catalogue"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02]"
            >
              Voir les offres
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Ligne mécanique inférieure */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/40 to-transparent"
      />
    </section>
  );
}
