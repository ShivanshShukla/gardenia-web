const shimmer = 'bg-muted rounded animate-pulse';

export function PlantingSpotsLayoutSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header controls skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className={`h-8 w-48 ${shimmer}`} />
        <div className="flex gap-2">
          <div className={`h-8 w-24 ${shimmer}`} />
          <div className={`h-8 w-24 ${shimmer}`} />
        </div>
      </div>

      {/* Grid and tray skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-xl border border-[var(--rule)] bg-[var(--paper-subtle)] p-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-dashed border-[var(--rule)] bg-[var(--paper)]/50 p-4 flex flex-col justify-between"
              >
                <div className={`h-4 w-1/2 ${shimmer}`} />
                <div className={`h-6 w-3/4 ${shimmer}`} />
                <div className={`h-2 w-full ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--rule)] bg-[var(--paper)] p-4 flex flex-col gap-3">
          <div className={`h-5 w-1/2 ${shimmer}`} />
          <div className="flex flex-col gap-2 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg border border-[var(--rule)] p-3 flex flex-col gap-2">
                <div className={`h-4 w-2/3 ${shimmer}`} />
                <div className={`h-3 w-1/3 ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
