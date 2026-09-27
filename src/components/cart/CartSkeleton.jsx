export function CartSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 rounded-xl bg-navy-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-mechanic-500/20 rounded animate-pulse" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-11 w-11 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-11 w-11 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-11 w-11 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
