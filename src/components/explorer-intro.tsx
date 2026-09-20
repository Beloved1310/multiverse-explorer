import type { ReactNode } from "react";

interface ExplorerIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

/** A consistent, compact starting point for each explorer view. */
export function ExplorerIntro({
  eyebrow,
  title,
  description,
  action,
}: ExplorerIntroProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        <p className="text-caption font-semibold text-brand">{eyebrow}</p>
        <h1 className="text-display font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-body leading-relaxed text-foreground-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
