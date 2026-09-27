"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  MessageCircle,
} from "lucide-react";

export default function GlobalError({ error, reset }) {
  const [errorId] = useState(
    () => `global_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );

  useEffect(() => {
    console.error("[app/global-error]", error);

    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.captureException(error, {
            tags: { scope: "global" },
            extra: { errorId },
          });
        })
        .catch(() => {});
    }
  }, [error, errorId]);

  return (
    <html lang="fr">
      <body className="bg-navy-950 text-offwhite-100 antialiased">
        <main className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
          {/* Mesh gradient */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20 mesh-gradient-warm opacity-40"
          />

          <div className="relative w-full max-w-lg text-center">
            {/* Icône */}
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
              Erreur critique
            </span>

            {/* Titre */}
            <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold text-white">
              Erreur critique
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-offwhite-100/60 leading-relaxed">
              Une erreur est survenue au niveau global de l'application. Nos
              équipes ont été notifiées. Vous pouvez tenter de recharger la page
              ou revenir à l'accueil.
            </p>

            {/* Error ID */}
            <p className="mt-3 font-mono text-[10px] text-offwhite-100/30">
              Référence : {errorId}
            </p>

            {/* Actions */}
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
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-semibold backdrop-blur-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Recharger
              </button>
            </div>

            {/* Accueil */}
            <div className="mt-4">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-offwhite-100/60 hover:text-mechanic-400 transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                Retour à l'accueil
              </a>
            </div>

            {/* Support */}
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

            {/* Détails dev */}
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-8 max-h-64 overflow-auto rounded-xl border border-white/10 bg-navy-950/80 p-4 text-[11px] text-rose-300 font-mono whitespace-pre-wrap break-all text-left">
                <div className="text-amber-400 mb-2">
                  Error: {error?.message}
                </div>
                {error?.stack && (
                  <div className="text-offwhite-100/40">{error.stack}</div>
                )}
              </pre>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
