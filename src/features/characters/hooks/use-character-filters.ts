"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildCharacterFiltersSearchParams,
  countActiveFilters,
  parseCharacterFiltersFromSearchParams,
  type CharacterFilters,
} from "../filters/character-filters";

interface UseCharacterFiltersResult {
  filters: CharacterFilters;
  setFilters: (patch: Partial<CharacterFilters>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

/**
 * The URL is the single source of truth for character filters: this hook
 * only ever reads from `useSearchParams` and writes via `router.replace`
 * (never `push`), so filtering never grows browser history -- pressing
 * back leaves the filtered view entirely, rather than undoing one filter
 * change at a time.
 */
export function useCharacterFilters(): UseCharacterFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseCharacterFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  // Refs so setFilters/clearFilters stay referentially stable across
  // renders -- a debounce-commit effect can safely depend on them without
  // re-subscribing on every filter change. Written in an effect (not
  // during render) per the rules-of-hooks "no ref writes during render".
  const filtersRef = useRef(filters);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    filtersRef.current = filters;
    pathnameRef.current = pathname;
  });

  const setFilters = useCallback(
    (patch: Partial<CharacterFilters>) => {
      const params = buildCharacterFiltersSearchParams({
        ...filtersRef.current,
        ...patch,
      });
      const query = params.toString();
      router.replace(
        query ? `${pathnameRef.current}?${query}` : pathnameRef.current,
        { scroll: false },
      );
    },
    [router],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathnameRef.current, { scroll: false });
  }, [router]);

  return {
    filters,
    setFilters,
    clearFilters,
    activeFilterCount: countActiveFilters(filters),
  };
}
