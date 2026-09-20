"use client";

import { useState } from "react";

/**
 * Local input state that stays responsive to typing, but snaps back in
 * sync whenever `value` changes from outside (e.g. the URL changed via
 * browser back/forward, or a "Clear all" action). Previously reinvented
 * three times across the filter bars (once inline in characters', once
 * as a local per-file helper in locations', once duplicated per-field in
 * episodes') -- one shared version now.
 *
 * Adjusting state during render like this, rather than in an effect, is
 * the pattern React itself recommends for syncing local state to a
 * changed prop -- it avoids an extra effect-triggered re-render.
 */
export function useSyncedInput(value: string) {
  const [input, setInput] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setInput(value);
  }
  return [input, setInput] as const;
}
