"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";

interface BackLinkProps {
  label: string;
}

/**
 * Not a real hyperlink deliberately: "back" isn't navigation to a fixed
 * URL, it's an action on browser history -- so a button is the correct
 * element here, not an anchor with a hardcoded href.
 *
 * Shared by every detail page (characters/episodes/locations): each one's
 * list filters change the URL via `router.replace` (never `push`), so
 * whatever search/filter state was active is still sitting in the one
 * history entry this goes back to -- nothing extra to preserve on this end.
 */
export function BackLink({ label }: BackLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 rounded-control text-caption font-medium text-foreground-muted transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
