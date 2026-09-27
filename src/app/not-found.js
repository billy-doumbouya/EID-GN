import Link from "next/link";
import { Bike, Home, Search, ArrowLeft, Phone, MessageCircle, Package } from "lucide-react";

export const metadata = {
  title: "404 — Page introuvable | EID-MULTISERVICE",
  description:
    "La page que vous recherchez n'existe pas ou a été déplacée. Explorez notre catalogue de motos, tricycles et pièces détachées.",
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: "/motos", label: "Motos", icon: Bike },
  { href: "/tricycles", label: "Tricycles", icon: Bike },
  { href: "/pieces", label: "Pièces détachées", icon: Package },
  { href: "/promotions", label: "Promotions", icon: Package },
];

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-navy-950 text-offwhite-100 overflow-hidden flex items-center justify-center px-4 py-16">
      {/* ============================================================
          BACKGROUND — Mesh gradient + grain
          ============================================================ */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 mesh-gradient-warm opacity-60"
      />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Lignes mécaniques horizontales */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/30 to-transparent"
      />

      {/* ============================================================
          CONTENT
          ============================================================ */}
      <div className="relative w-full max-w-2xl text-center">
        {/* "404" géant stylisé */}
        <div className="relative inline-block">
          {/* Halo mechanic */}
          <div
            aria-hidden
            className="absolute -inset-8 rounded-full bg-mechanic-500/15 blur-3xl"
          />

          <h1
            className="relative font-display text-[8rem] sm:text-[12rem] md:text-[14rem] font-bold leading-none tracking-tighter"
            aria-label="Erreur 404 - Page introuvable"
          >
            <span className="bg-gradient-to-br from-white via-offwhite-100/80 to-mechanic-500/40 bg-clip-text text-transparent">
              4
            </span>
            <span className="relative inline-block mx-1">
              <span className="bg-gradient-to-br from-mechanic-400 to-amber-500 bg-clip-text text-transparent">
                0
              </span>
              {/* Icône Bike centrée dans le 0 — remplaçante */}
              <Bike
                aria-hidden
                className="absolute inset-0 m-auto h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 text-mechanic-500/30"
                strokeWidth={1.2}
              />
            </span>
            <span className="bg-gradient-to-br from-white via-offwhite-100/80 to-mechanic-500/40 bg-clip-text text-transparent">
              4
            </span>
          </h1>
        </div>

        {/* Badge énergétique */}
        <span className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full border border-mechanic-500/30 bg-mechanic-500/5 backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider text-mechanic-400">
          <span className="w-1.5 h-1.5 rounded-full bg-mechanic-500 animate-pulse" />
          Erreur 404 — Page introuvable
        </span>

        {/* Titre + description */}
        <h2 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white">
          Cette page a pris la tangente
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm md:text-base text-offwhite-100/60 leading-relaxed">
          La page que vous cherchez n'existe pas, a été déplacée, ou n'a jamais
          existé. Mais pas de panique — votre prochaine moto n'est qu'à quelques
          clics.
        </p>

        {/* ============================================================
            ACTIONS PRIMAIRES
            ============================================================ */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02]"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <Link
            href="/catalogue"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-semibold backdrop-blur-sm transition-colors"
          >
            <Search className="h-4 w-4" />
            Explorer le catalogue
          </Link>
        </div>

        {/* ============================================================
            QUICK LINKS — Accès direct aux catégories
            ============================================================ */}
        <div className="mt-12">
          <p className="font-mono text-xs uppercase tracking-wider text-offwhite-100/40 mb-4">
            Ou accédez directement à
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-mechanic-500/30 hover:bg-mechanic-500/[0.03]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mechanic-500/10 border border-mechanic-500/20 text-mechanic-400 transition-colors group-hover:bg-mechanic-500 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-offwhite-100/80 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            SUPPORT — Contact si vraiment bloqué
            ============================================================ */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-sm text-offwhite-100/60 mb-3">
            Toujours pas trouvé ce que vous cherchez ?
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a
              href="tel:+224622000000"
              className="inline-flex items-center gap-1.5 text-offwhite-100/60 hover:text-mechanic-400 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              Appeler le support
            </a>
            <span className="text-offwhite-100/20">·</span>
            <a
              href="https://wa.me/224622000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-offwhite-100/60 hover:text-mechanic-400 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Footer signature */}
        <p className="mt-12 text-xs text-offwhite-100/30 font-mono">
          EID-MULTISERVICE — Kankan, Haute-Guinée · Depuis 2016
        </p>
      </div>
    </main>
  );
}