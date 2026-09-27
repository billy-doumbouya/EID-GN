import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Headset } from "lucide-react";
import { GuineaDeliveryMap } from "@/components/GuineaDeliveryMap";
import { Reveal } from "@/components/motion/Reveal";
import { StatCounter } from "@/components/stats/AboutStats/StatCounter";

export const metadata = {
  title: "À propos — EID-MULTISERVICE",
  description:
    "Depuis 2016 à Kankan, EID-MULTISERVICE livre motos, tricycles et pièces détachées dans toute la Guinée. Découvrez notre histoire et nos engagements.",
};

const VALEURS = [
  {
    icon: ShieldCheck,
    titre: "Compatibilité garantie",
    desc: "Chaque pièce est vérifiée et filtrée par modèle exact avant expédition. Fini les erreurs de référence qui vous font perdre un jour d'atelier.",
  },
  {
    icon: Truck,
    titre: "Réseau national",
    desc: "Depuis notre centre de distribution à Kankan, nous livrons désormais les 8 régions du pays sous 48h maximum, avec suivi en temps réel.",
  },
  {
    icon: Headset,
    titre: "Service après-vente",
    desc: "Une équipe technique disponible par téléphone et WhatsApp pour vous accompagner sur le choix des pièces et la résolution de pannes.",
  },
];

const TIMELINE = [
  {
    annee: "2016",
    titre: "L'origine",
    texte: "Ouverture du premier atelier de pièces détachées à Kankan, quartier par quartier.",
  },
  {
    annee: "2019",
    titre: "Cap tricycles",
    texte: "Extension de l'activité aux tricycles utilitaires pour les commerçants locaux.",
  },
  {
    annee: "2022",
    titre: "Motos neuves",
    texte: "Lancement de la vente de motos neuves et d'occasions vérifiées par nos mécaniciens.",
  },
  {
    annee: "2025",
    titre: "Digitalisation",
    texte: "Catalogue en ligne, paiement mobile money, livraison traquée — le commerce moderne arrive en Haute-Guinée.",
  },
  {
    annee: "2026",
    titre: "Couverture nationale",
    texte: "Extension de la livraison aux 8 régions de Guinée, depuis notre hub de Kankan.",
  },
];

const PAYMENT_METHODS = [
  { name: "Orange Money", src: "/payment-logo/orange.png" },
  { name: "MTN MoMo", src: "/payment-logo/mtn.png" },
  { name: "Moov Money", src: "/payment-logo/moov.png" },
  { name: "Visa", src: "/payment-logo/visa.png" },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-navy-950 text-offwhite-100 overflow-hidden">
      {/* ============================================================
          SECTION 1 — HERO ÉDITORIAL SOMBRE
          ============================================================ */}
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Mesh gradient background (CSS pur, animé GPU-only) */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20 mesh-gradient-warm opacity-70"
        />

        {/* Grain SVG subtil (overlay photographique) */}
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

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-mechanic-500/30 bg-mechanic-500/5 backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider text-mechanic-400">
              <span className="w-1.5 h-1.5 rounded-full bg-mechanic-500 animate-pulse" />
              Depuis 2016 — Kankan, Haute-Guinée
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-8 font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white">
              De l'atelier de Kankan
              <br />
              <span className="bg-gradient-to-r from-mechanic-400 to-amber-500 bg-clip-text text-transparent">
                à tout le pays
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-offwhite-100/70 leading-relaxed">
              Une histoire de confiance née quartier par quartier à Kankan,
              qui livre aujourd'hui l'ensemble des régions de Guinée.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalogue"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02]"
              >
                Explorer le catalogue
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-semibold backdrop-blur-sm transition-colors"
              >
                Nous contacter
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

      {/* ============================================================
          SECTION 2 — STATS EN BANDEAU (type magazine)
          ============================================================ */}
      <section className="relative border-y border-white/5 bg-navy-900/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-y-0">
            <StatBlock value={9} suffix="+" label="Années d'activité" />
            <StatBlock value={3200} suffix="+" label="Clients servis" withDivider />
            <StatBlock value={8} label="Régions couvertes" withDivider />
            <StatBlock value={48} suffix="h" label="Délai max livraison" withDivider />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — TIMELINE "NOTRE PARCOURS"
          ============================================================ */}
      <section className="relative py-24 md:py-32">
        {/* Halo mechanic subtil */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-mechanic-500/5 blur-[120px] pointer-events-none"
        />

        <div className="relative mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-wider text-mechanic-400">
                Notre parcours
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-white">
                10 ans de croissance
                <br className="hidden md:block" />
                <span className="text-offwhite-100/50">à votre service</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
            <div
              aria-hidden
              className="absolute left-8 md:left-12 top-12 bottom-12 w-px bg-gradient-to-b from-mechanic-500/0 via-mechanic-500/40 to-mechanic-500/0"
            />

            <div className="space-y-10 md:space-y-12 pl-8 md:pl-12">
              {TIMELINE.map((item, i) => (
                <Reveal key={item.annee} delay={i * 0.08}>
                  <div className="relative group">
                    <span
                      aria-hidden
                      className="absolute -left-[42px] md:-left-[42px] top-1.5 flex h-3 w-3 items-center justify-center"
                    >
                      <span className="absolute inset-0 rounded-full bg-mechanic-500/30 animate-ping" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-mechanic-500 ring-4 ring-navy-950" />
                    </span>

                    <span className="inline-block font-mono text-xs font-bold uppercase tracking-wider text-mechanic-400 mb-1.5">
                      {item.annee}
                    </span>

                    <h3 className="font-display text-lg font-semibold text-white">
                      {item.titre}
                    </h3>

                    <p className="mt-2 text-sm md:text-base text-offwhite-100/60 leading-relaxed max-w-lg">
                      {item.texte}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — VALEURS (3 cards glass + hover lift)
          ============================================================ */}
      <section className="relative py-24 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-wider text-mechanic-400">
                Nos engagements
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-white">
                Ce qui nous engage
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {VALEURS.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.titre} delay={i * 0.08}>
                  <div className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-mechanic-500/30 hover:bg-mechanic-500/[0.03]">
                    <div
                      aria-hidden
                      className="absolute -inset-px rounded-2xl bg-gradient-to-b from-mechanic-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        maskImage: "linear-gradient(black, transparent 60%)",
                        WebkitMaskImage: "linear-gradient(black, transparent 60%)",
                      }}
                    />

                    <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400 group-hover:bg-mechanic-500 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>

                    <h3 className="relative mt-5 font-display text-lg font-semibold text-white">
                      {v.titre}
                    </h3>
                    <p className="relative mt-2 text-sm text-offwhite-100/60 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — CARTE DE LIVRAISON NATIONALE
          ============================================================ */}
      <section className="relative py-24 md:py-32 border-t border-white/5">
        <div
          aria-hidden
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"
        />

        <div className="relative mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-mechanic-400">
                Couverture nationale
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-white">
                Un réseau qui couvre
                <br className="hidden md:block" />
                <span className="text-offwhite-100/50">tout le pays</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-offwhite-100/60">
                Depuis notre centre de distribution à Kankan, vers chaque
                région de Guinée sous 48h maximum.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-2xl">
              <div className="rounded-2xl bg-navy-950/50 p-4 md:p-6 [&_svg]:!text-offwhite-100">
                <GuineaDeliveryMap />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          SECTION 6 — MOYENS DE PAIEMENT + CTA FINAL
          ============================================================ */}
      <section className="relative py-24 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="font-mono text-xs uppercase tracking-wider text-mechanic-400">
                Paiement
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-white">
                Payez en toute confiance
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-offwhite-100/60">
                Mobile Money et carte bancaire, sans intermédiaire ni frais
                cachés.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.name}
                  className="group flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 transition-all duration-300 hover:border-mechanic-500/30 hover:bg-white/[0.06]"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={method.src}
                      alt={method.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="180px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-16 text-center">
              <div className="relative inline-block">
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-3xl bg-mechanic-500/20 blur-2xl"
                />
                <Link
                  href="/catalogue"
                  className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold text-lg transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02]"
                >
                  Découvrir nos motos & pièces
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <p className="mt-6 text-xs text-offwhite-100/40 font-mono">
                EID-MULTISERVICE — Kankan, Haute-Guinée · Depuis 2016
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   COMPOSANT STAT BLOCK — sans card, séparateur vertical
   ============================================================ */
function StatBlock({ value, suffix, label, withDivider }) {
  return (
    <div
      className={`relative text-center ${
        withDivider ? "md:border-l md:border-white/10" : ""
      }`}
    >
      <div className="font-display text-4xl md:text-5xl font-bold text-white">
        <StatCounter value={value} suffix={suffix} />
      </div>
      <div className="mt-2 text-xs md:text-sm text-offwhite-100/50 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}