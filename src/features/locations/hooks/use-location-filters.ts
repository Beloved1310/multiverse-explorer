"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildLocationFiltersSearchParams,
  countActiveLocationFilters,
  parseLocationFiltersFromSearchParams,
  type LocationFilters,
} from "../filters/location-filters";

interface UseLocationFiltersResult {
  filters: LocationFilters;
  setFilters: (patch: Partial<LocationFilters>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

/** The URL is the single source of truth for location filters -- see useCharacterFilters.ts for the full rationale. */
export function useLocationFilters(): UseLocationFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseLocationFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const filtersRef = useRef(filters);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    filtersRef.current = filters;
    pathnameRef.current = pathname;
  });

  const setFilters = useCallback(
    (patch: Partial<LocationFilters>) => {
      const params = buildLocationFiltersSearchParams({
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
    activeFilterCount: countActiveLocationFilters(filters),
  };
}
