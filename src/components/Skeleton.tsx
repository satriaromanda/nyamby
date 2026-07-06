// Shared loading placeholder — uses the .skeleton shimmer class already
// defined in globals.css.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// A grid of card-shaped skeletons, for list/grid pages fetching data (talent
// list, job list, etc.) instead of a blocking centered spinner.
export function SkeletonCardGrid({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid md:grid-cols-2 xl:grid-cols-3 gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
