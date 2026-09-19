import { Card } from "./card";

/**
 * Decorative loading placeholder -- hidden from assistive tech. The
 * surrounding grid is responsible for announcing the loading state once,
 * rather than each skeleton announcing itself.
 */
export function SkeletonCard() {
  return (
    <Card aria-hidden="true" className="overflow-hidden">
      <div className="h-1 w-full bg-foreground-muted/20" />
      <div className="relative aspect-square w-full animate-pulse bg-foreground-muted/20">
        <div className="absolute inset-x-3 bottom-3 h-5 w-2/3 rounded bg-foreground-muted/30" />
      </div>
      <div className="space-y-1.5 p-3">
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-foreground-muted/20" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-foreground-muted/20" />
      </div>
    </Card>
  );
}
