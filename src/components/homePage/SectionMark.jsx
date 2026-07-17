// src/components/homePage/SectionMark.jsx
// Separateur discret entre sections : deux traits pointilles encadrant un
// label mono. Renforce l'identite "fiche technique" sans repeter le
// ZigzagDivider (deja utilise ailleurs sur le site).
export function SectionMark({ label }) {
  return (
    <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-2">
      <span className="h-px flex-1 border-t border-dashed border-navy-800/15" />
      <span className="font-mono text-[10px] tracking-[0.2em] text-navy-800/35">
        {label}
      </span>
      <span className="h-px flex-1 border-t border-dashed border-navy-800/15" />
    </div>
  );
}