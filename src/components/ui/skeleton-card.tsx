import { Card } from "./card";

/**
 * Decorative loading placeholder -- hidden from assistive tech. The
 * surrounding grid is responsible for announcing the loading state once,
 * rather than each skeleton announcing itself.
 */
export function SkeletonCard() {
  return (
    <Card aria-hidden="true" className="overflow-hidden">
      <div className="aspect-square w-full animate-pulse bg-foreground-muted/20" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-foreground-muted/20" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-foreground-muted/20" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-foreground-muted/20" />
      </div>
    </Card>
  );
}
