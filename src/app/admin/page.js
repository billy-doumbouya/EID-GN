import { StatsCharts } from "@/components/admin/StatsCharts";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Vue d'ensemble" };

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden border border-red-500/20 bg-black text-zinc-300 shadow-[0_0_30px_rgba(220,38,38,0.05)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-30" />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-widest text-red-400">
              <span className="h-2 w-2 rounded-none animate-pulse bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
              Accès administrateur · Session active
            </p>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Console de supervision
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Pilotage opérationnel de la boutique EID-GN. Toutes les actions sont surveillées.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-800 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <ShieldCheck className="h-10 w-10 shrink-0 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" strokeWidth={1} />
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Contrôle d'accès
              </p>
              <p className="mt-1 text-sm font-bold text-red-400">
                Administrateur
              </p>
            </div>
          </div>
        </div>
      </section>
      <StatsCharts />
    </div>
  );
}
