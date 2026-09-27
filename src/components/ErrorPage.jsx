"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function ErrorPage({ error, info, errorId, onReset, reset }) {
  const [internalErrorId] = useState(
    () => errorId || `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const [showDetails, setShowDetails] = useState(false);

  const handleReset = () => {
    if (typeof onReset === "function") {
      onReset();
    } else if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main
      role="alert"
      className="relative min-h-[75vh] w-full bg-navy-950 text-offwhite-100 flex items-center justify-center px-4 py-16 overflow-hidden"
    >
      {/* Mesh gradient subtil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 mesh-gradient-warm opacity-40 pointer-events-none"
      />

      {/* Grain SVG subtil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Lignes mécaniques de séparation */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/30 to-transparent pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mechanic-500/30 to-transparent pointer-events-none"
      />

      <div className="relative w-full max-w-lg text-center">
        {/* Icône avec halo */}
        <div className="relative inline-flex h-20 w-20 items-center justify-center mb-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-500/30 bg-rose-500/[0.1] backdrop-blur-sm">
            <AlertTriangle className="h-10 w-10 text-rose-400" strokeWidth={2} />
          </div>
        </div>

        {/* Badge statut */}
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Erreur technique
          </span>
        </div>

        {/* Titre & Description */}
        <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
          Une erreur est survenue
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-offwhite-100/70 leading-relaxed">
          Un dysfonctionnement inattendu a empêché l&apos;affichage de cette page.
          Vous pouvez réessayer, actualiser la page ou contacter notre équipe.
        </p>

        {/* Référence technique */}
        <p className="mt-3 font-mono text-[11px] text-offwhite-100/40">
          Référence : <span className="text-offwhite-100/60 font-semibold">{internalErrorId}</span>
        </p>

        {/* Actions principales */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleReset}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
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

        {/* Lien retour accueil */}
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-offwhite-100/60 hover:text-mechanic-400 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Contact support */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-offwhite-100/50 mb-2">
            Besoin d&apos;assistance immédiate ?
          </p>
          <a
            href="https://wa.me/224622000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Contacter le support WhatsApp
          </a>
        </div>

        {/* Détails techniques (dev only ou si message dispo) */}
        {(process.env.NODE_ENV === "development" || error?.message) && (
          <div className="mt-8 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-xs text-offwhite-100/40 hover:text-offwhite-100/70 transition-colors cursor-pointer"
            >
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Détails techniques
            </button>

            {showDetails && (
              <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-white/10 bg-navy-900/90 p-4 text-[11px] text-rose-300 font-mono whitespace-pre-wrap break-all">
                {error?.message && (
                  <div className="text-amber-400 mb-2 font-semibold">
                    Error: {error.message}
                  </div>
                )}
                {info?.componentStack && (
                  <div className="text-offwhite-100/50 mb-2">
                    {info.componentStack}
                  </div>
                )}
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

export default ErrorPage;
