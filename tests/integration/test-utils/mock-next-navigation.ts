import { useEffect, useState } from "react";
import { vi } from "vitest";

/**
 * A minimal stand-in for the App Router's navigation hooks, scoped to what
 * `useCharacterFilters` actually relies on: reading the current query
 * string and writing a new one via `router.replace`. Filters are modelled
 * as "the URL is the source of truth" in the real app (see
 * useCharacterFilters.ts), so an integration test has to make that loop
 * actually close -- a stub `useSearchParams` that never changes would only
 * prove the read side works, not that typing/selecting a filter feeds back
 * into a re-render with the new filters applied.
 */
let currentQuery = "";
const listeners = new Set<(query: string) => void>();

function emitChange() {
  listeners.forEach((listener) => listener(currentQuery));
}

export function __setSearch(query: string) {
  currentQuery = query;
  emitChange();
}

export function __resetNavigationMock() {
  currentQuery = "";
  listeners.clear();
  routerReplace.mockClear();
}

export const routerReplace = vi.fn((url: string) => {
  const query = url.includes("?") ? (url.split("?")[1] ?? "") : "";
  __setSearch(query);
});

// A single module-level object, not one freshly built per call: the real
// `next/navigation` router is a stable singleton across renders.
// `useCharacterFilters` memoizes `setFilters` via `useCallback([router])`,
// so a router that changed identity on every render broke that
// memoization -- `setFilters` got a new identity every render, which
// re-triggered the search box's debounce effect (deps: `[debouncedName,
// onFiltersChange]`) on every single render, not just when the debounced
// value actually changed. That fed back into another `router.replace`
// call, which (via this mock) re-rendered the tree again, forever.
const router = {
  replace: routerReplace,
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export function useRouter() {
  return router;
}

export function usePathname() {
  return "/";
}

export function useSearchParams() {
  // The lazy initializer reads `currentQuery` at mount time, which is
  // already correct as long as tests reset the mock (via
  // __resetNavigationMock) before rendering -- no separate resync needed.
  const [query, setQuery] = useState(currentQuery);

  useEffect(() => {
    listeners.add(setQuery);
    return () => {
      listeners.delete(setQuery);
    };
  }, []);

  return new URLSearchParams(query);
}
