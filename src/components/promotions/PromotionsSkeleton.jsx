export function PromotionsSkeleton({ count = 8, variant = "default" }) {
  if (variant === "top") {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <div className="aspect-[4/3] bg-navy-800 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
              <div className="h-7 w-1/2 bg-mechanic-500/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
          <div className="aspect-square bg-navy-800 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-mechanic-500/20 rounded animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
