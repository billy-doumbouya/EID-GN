"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorComponent({
  error,
  errorId,
  onReset,
  reset,
  label = "Élément indisponible",
}) {
  const handleReset = (e) => {
    e?.stopPropagation?.();
    if (typeof onReset === "function") {
      onReset();
    } else if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  const tooltip = error?.message
    ? `${label}: ${error.message}${errorId ? ` (${errorId})` : ""}`
    : label;

  return (
    <div
      role="alert"
      title={tooltip}
      className="inline-flex items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 backdrop-blur-sm max-w-full"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
      <span className="truncate max-w-[180px] sm:max-w-xs font-medium">
        {label}
      </span>
      <button
        type="button"
        onClick={handleReset}
        title="Réessayer"
        className="ml-1 inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[11px] font-medium text-rose-200 hover:bg-rose-500/30 hover:text-white transition-colors cursor-pointer"
      >
        <RefreshCw className="h-2.5 w-2.5" />
        <span>Réessayer</span>
      </button>
    </div>
  );
}

export default ErrorComponent;
