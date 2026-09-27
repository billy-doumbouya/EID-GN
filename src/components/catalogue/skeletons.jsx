export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl bg-white p-3.5 sm:p-4 border border-navy-900/5 shadow-card"
        >
          <div className="aspect-square w-full rounded-xl bg-navy-900/10 animate-pulse" />
          <div className="pt-3.5 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-1/3 bg-navy-900/10 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-navy-900/10 rounded animate-pulse" />
            </div>
            <div className="pt-3 space-y-2">
              <div className="h-5 w-1/2 bg-navy-900/10 rounded animate-pulse" />
              <div className="h-9 w-full bg-navy-900/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
