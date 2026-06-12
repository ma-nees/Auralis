export function SongRowSkeleton({ count = 5, startIndex = 0 }: { count?: number; startIndex?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl p-2 bg-card/20 animate-pulse border border-border/10"
        >
          <div className="hidden w-5 text-center text-sm font-semibold text-muted-foreground/30 sm:block">
            {startIndex + i + 1}
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted/50" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted/50" />
            <div className="h-3 w-1/4 rounded bg-muted/30" />
          </div>
          <div className="hidden h-3 w-16 rounded bg-muted/30 sm:block" />
          <div className="h-4 w-4 rounded-full bg-muted/30" />
          <div className="h-3 w-8 rounded bg-muted/30" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl p-3 bg-card/20 border border-border/10 animate-pulse"
        >
          <div className="aspect-square w-full rounded-xl bg-muted/50 mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted/50" />
            <div className="h-3 w-1/2 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArtistGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center text-center p-3 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-muted/50 mb-3" />
          <div className="space-y-1.5 w-full flex flex-col items-center">
            <div className="h-3.5 w-3/4 rounded bg-muted/50" />
            <div className="h-2.5 w-1/2 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
