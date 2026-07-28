// src/components/homePage/SectionMark.jsx

export function SectionMark({ label }) {
  return (
    <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
      {/* Rainure neumorphique gauche */}
      <div className="h-[2px] flex-1 bg-[#e6eef8] shadow-[inset_1px_1px_2px_#c3cad3,1px_1px_1px_#ffffff]" />

      {/* Badge central encastré (Inset) */}
      <span className="rounded-full bg-[#e6eef8] px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-slate-500 shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]">
        {label}
      </span>

      {/* Rainure neumorphique droite */}
      <div className="h-[2px] flex-1 bg-[#e6eef8] shadow-[inset_1px_1px_2px_#c3cad3,1px_1px_1px_#ffffff]" />
    </div>
  );
}
