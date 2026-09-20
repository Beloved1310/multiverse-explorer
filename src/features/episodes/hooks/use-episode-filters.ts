"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildEpisodeFiltersSearchParams,
  countActiveEpisodeFilters,
  parseEpisodeFiltersFromSearchParams,
  type EpisodeFilters,
} from "../filters/episode-filters";

interface UseEpisodeFiltersResult {
  filters: EpisodeFilters;
  setFilters: (patch: Partial<EpisodeFilters>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

/**
 * The URL is the single source of truth for episode filters -- same
 * pattern as useCharacterFilters: only ever reads from `useSearchParams`
 * and writes via `router.replace` (never `push`), so filtering never
 * grows browser history.
 */
export function useEpisodeFilters(): UseEpisodeFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseEpisodeFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const filtersRef = useRef(filters);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    filtersRef.current = filters;
    pathnameRef.current = pathname;
  });

  const setFilters = useCallback(
    (patch: Partial<EpisodeFilters>) => {
      const params = buildEpisodeFiltersSearchParams({
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
    activeFilterCount: countActiveEpisodeFilters(filters),
  };
}
