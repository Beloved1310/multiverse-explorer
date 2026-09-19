import type { ReactNode } from "react";

type BadgeTone = "alive" | "dead" | "unknown";

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  alive: "bg-status-alive-bg text-status-alive-fg",
  dead: "bg-status-dead-bg text-status-dead-fg",
  unknown: "bg-status-unknown-bg text-status-unknown-fg",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  alive: "bg-status-alive-fg",
  dead: "bg-status-dead-fg",
  unknown: "bg-status-unknown-fg",
};

/**
 * Status is always conveyed through the text label, never colour alone --
 * the dot is decorative (aria-hidden) and purely reinforces it visually.
 */
export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium ${TONE_CLASSES[tone]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`}
      />
      {children}
    </span>
  );
}
