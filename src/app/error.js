"use client";

import { useEffect } from "react";

// Convention Next.js App Router : ce fichier agit comme error boundary
// automatique pour ce segment de route (complementaire au composant
// ErrorBoundary utilise dans Providers pour les erreurs cote client hors-route).
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <h2 className="text-xl font-semibold text-navy-900">Une erreur est survenue</h2>
      <p className="mt-2 text-navy-800/70">
        Notre equipe technique a ete notifiee. Vous pouvez reessayer ou revenir a l&apos;accueil.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-mechanic-500 px-5 py-2 text-white hover:bg-mechanic-600"
        >
          Reessayer
        </button>
        <a href="/" className="rounded-lg border border-navy-800/20 px-5 py-2 text-navy-900 hover:bg-offwhite-200">
          Retour a l&apos;accueil
        </a>
      </div>
    </div>
  );
}
