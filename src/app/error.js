// app/error.jsx (ou src/app/error.jsx)
"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Fond animé avec dégradé et particules */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-900 via-navy-800 to-offwhite-100" />
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-mechanic-500/20),transparent_70%)] animate-pulse-slow" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDuration: `${6 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 6}s`,
              animationName: "float-particle",
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-md animate-fade-up">
        {/* Icône d'erreur animée */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-mechanic-500 bg-mechanic-500/10 text-mechanic-500 animate-pulse-ring">
          <svg
            className="h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-3.75 0a3.75 3.75 0 017.5 0M9 16.5h6M9 16.5a3 3 0 110-6 3 3 0 010 6zm9.75-1.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h2 className="mt-4 bg-gradient-to-r from-mechanic-500 via-amber-500 to-mechanic-500 bg-clip-text text-3xl font-bold text-transparent bg-300% animate-gradient">
          Oups ! Une erreur est survenue
        </h2>

        <p className="mt-3 text-navy-800/70 dark:text-white/70">
          Notre équipe technique a été notifiée. Vous pouvez réessayer ou
          revenir à l'accueil.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="group relative overflow-hidden rounded-lg bg-mechanic-500 px-6 py-2.5 font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-mechanic-500/30"
          >
            <span className="relative z-10">Réessayer</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <a
            href="/"
            className="group relative overflow-hidden rounded-lg border border-navy-800/20 bg-white/10 px-6 py-2.5 font-medium text-navy-900 backdrop-blur-sm transition-all hover:scale-105 hover:border-mechanic-500/50 hover:bg-mechanic-500/10"
          >
            <span className="relative z-10">Retour à l'accueil</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-mechanic-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>
        </div>
      </div>
    </div>
  );
}
