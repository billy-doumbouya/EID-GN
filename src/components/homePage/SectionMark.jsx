import { cn } from "@/lib/utils";

/**
 * Séparateur de section avec badge central.
 * Utilise des lignes mécaniques fines (gradient mechanic-500) au lieu de néomorphisme.
 *
 * @param {string} label - Texte du badge
 * @param {('default'|'compact'|'wide')} variant - Style du séparateur
 * @param {('center'|'left')} align - Alignement du badge
 * @param {string} className - Classes additionnelles
 */
export function SectionMark({
  label,
  variant = "default",
  align = "center",
  className,
}) {
  return (
    <div
      role="heading"
      aria-level={2}
      className={cn(
        "flex items-center gap-4",
        variant === "compact" && "py-2",
        variant === "default" && "py-4",
        variant === "wide" && "py-6",
        align === "center" && "justify-center text-center",
        align === "left" && "justify-start text-left",
        className
      )}
    >
      {/* Ligne mécanique gauche (uniquement en align center) */}
      {align === "center" && (
        <div
          aria-hidden
          className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-mechanic-500/40"
        />
      )}

      {/* Badge central */}
      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-mechanic-400">
        <span
          aria-hidden
          className="h-1 w-1 rounded-full bg-mechanic-500"
        />
        {label}
      </span>

      {/* Ligne mécanique droite */}
      {align === "center" && (
        <div
          aria-hidden
          className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-mechanic-500/40"
        />
      )}
    </div>
  );
}