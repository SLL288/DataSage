export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="h-3 w-24 animate-pulse rounded-full bg-white/20" />
      <div className="mt-3 h-6 w-32 animate-pulse rounded-full bg-white/30" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="h-4 w-28 animate-pulse rounded-full bg-white/20" />
      <div className="mt-4 h-56 animate-pulse rounded-xl bg-white/10" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/20" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-white/15" />
        </div>
      ))}
    </div>
  );
}
