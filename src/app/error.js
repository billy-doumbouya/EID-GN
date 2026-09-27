"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Error({ error, reset }) {
  const [errorId] = useState(
    () => `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Logger en console (toujours)
    console.error("[app/error]", error);

    // Sentry en prod (import dynamique pour ne pas bundler inutilement)
    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.captureException(error, {
            tags: { scope: "page" },
            extra: { errorId },
          });
        })
        .catch(() => {});
    }
  }, [error, errorId]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="relative min-h-[80vh] bg-navy-950 text-offwhite-100 flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Mesh gradient subtil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 mesh-gradient-warm opacity-40"
      />

      {/* Grain SVG subtil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Lignes mécaniques */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/30 to-transparent"
      />

      <div className="relative w-full max-w-lg text-center">
        {/* Icône avec halo */}
        <div className="relative inline-flex h-20 w-20 items-center justify-center mb-6">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-500/30 bg-rose-500/[0.1] backdrop-blur-sm">
            <AlertTriangle className="h-10 w-10 text-rose-400" strokeWidth={2} />
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Erreur technique
        </span>

        {/* Titre */}
        <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white">
          Une erreur est survenue
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-offwhite-100/60 leading-relaxed">
          Nos équipes ont été notifiées et travaillent à résoudre le problème.
          Vous pouvez réessayer, recharger la page, ou nous contacter si le
          problème persiste.
        </p>

        {/* Error ID pour support */}
        <p className="mt-3 font-mono text-[10px] text-offwhite-100/30">
          Référence : {errorId}
        </p>

        {/* Actions principales */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            Réessayer
          </button>

          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-semibold backdrop-blur-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Recharger la page
          </button>
        </div>

        {/* Lien accueil */}
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-offwhite-100/60 hover:text-mechanic-400 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Contact support */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-sm text-offwhite-100/60 mb-3">
            Toujours bloqué ?
          </p>
          <a
            href="https://wa.me/224622000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Contacter le support WhatsApp
          </a>
        </div>

        {/* Détails techniques (dev only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-xs text-offwhite-100/40 hover:text-offwhite-100/70 cursor-pointer"
            >
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Détails techniques
            </button>

            {showDetails && (
              <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-white/10 bg-navy-950/80 p-4 text-[11px] text-rose-300 font-mono whitespace-pre-wrap break-all">
                <div className="text-amber-400 mb-2">
                  Error: {error?.message}
                </div>
                {error?.stack && (
                  <div className="text-offwhite-100/40">{error.stack}</div>
                )}
              </pre>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
