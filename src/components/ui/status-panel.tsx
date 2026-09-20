import type { ReactNode } from "react";

type StatusPanelTone = "brand" | "danger";

interface StatusPanelProps {
  tone: StatusPanelTone;
  icon: ReactNode;
  heading: string;
  description: string;
  action?: ReactNode;
}

const TONE_CLASSES: Record<StatusPanelTone, string> = {
  brand: "bg-brand-subtle text-brand",
  danger: "bg-status-dead-bg text-status-dead-fg",
};

/**
 * The icon-circle + heading + caption (+ optional action) shape used by
 * every empty, error, and not-found state across all three verticals --
 * previously copy-pasted six times over with only the copy text differing.
 */
export function StatusPanel({
  tone,
  icon,
  heading,
  description,
  action,
}: StatusPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <p className="text-body font-medium text-foreground">{heading}</p>
        <p className="text-caption text-foreground-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
