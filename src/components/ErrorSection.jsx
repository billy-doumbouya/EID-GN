"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export function ErrorSection({
  error,
  info,
  errorId,
  onReset,
  reset,
  title = "Impossible de charger cette section",
  message = "Une anomalie technique empêche l'affichage complet de ce contenu.",
}) {
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

  return (
    <section
      role="alert"
      className="relative my-4 w-full overflow-hidden rounded-2xl border border-rose-500/20 bg-navy-900/80 p-6 md:p-8 backdrop-blur-md shadow-lg"
    >
      {/* Halo lumineux discret */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent pointer-events-none"
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-start gap-4">
          {/* Badge icône */}
          <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-6 w-6" strokeWidth={2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 font-mono text-[10px] font-bold uppercase text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Incident section
              </span>
              {errorId && (
                <span className="font-mono text-[10px] text-offwhite-100/40">
                  #{errorId}
                </span>
              )}
            </div>

            <h3 className="mt-1.5 font-display text-base sm:text-lg font-bold text-white">
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-offwhite-100/60 leading-relaxed max-w-xl">
              {message}
            </p>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={handleReset}
            className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-mechanic-500 hover:bg-mechanic-400 text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-glow-mechanic hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500" />
            Réessayer
          </button>
        </div>
      </div>

      {/* Détails techniques si erreur ou dev */}
      {(process.env.NODE_ENV === "development" || error?.message) && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-[11px] text-offwhite-100/40 hover:text-offwhite-100/70 transition-colors cursor-pointer"
          >
            {showDetails ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Détails techniques
          </button>

          {showDetails && (
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-white/10 bg-navy-950 p-3 text-[11px] text-rose-300 font-mono whitespace-pre-wrap break-all">
              {error?.message && <div>{error.message}</div>}
              {info?.componentStack && (
                <div className="text-offwhite-100/40 mt-1">
                  {info.componentStack}
                </div>
              )}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}

export default ErrorSection;
