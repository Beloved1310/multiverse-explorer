"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GetLocationsQuery } from "../api/get-locations";
import { mapLocation } from "../mapping/map-location";
import type { Location } from "../domain/location";
import {
  toGraphQLLocationFilter,
  type LocationFilters,
} from "../filters/location-filters";

const FIRST_PAGE = 1;

interface UseLocationsResult {
  locations: Location[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  totalCount: number | null;
  loadMore: () => void;
  refetch: () => void;
}

/** Fetches locations matching `filters`, paginated, mapped to our domain type. */
export function useLocations(filters: LocationFilters): UseLocationsResult {
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetchingMoreRef = useRef(false);

  const { data, loading, error, refetch, fetchMore } = useQuery(
    GetLocationsQuery,
    {
      variables: {
        filter: toGraphQLLocationFilter(filters),
        page: FIRST_PAGE,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const locations = useMemo(() => {
    const results = data?.locations?.results ?? [];
    return results.filter((result) => result !== null).map(mapLocation);
  }, [data]);

  const nextPage = data?.locations?.info?.next ?? null;
  const hasMore = nextPage !== null;
  const totalCount = data?.locations?.info?.count ?? null;

  const loadMore = useCallback(() => {
    if (isFetchingMoreRef.current || nextPage === null) return;

    isFetchingMoreRef.current = true;
    setLoadingMore(true);

    fetchMore({ variables: { page: nextPage } })
      .catch(() => {
        // real failures are already logged by the dev-only ErrorLink;
        // the "Load more" control simply stays available to try again
      })
      .finally(() => {
        isFetchingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [fetchMore, nextPage]);

  return {
    locations,
    loading: loading && locations.length === 0,
    loadingMore,
    error: Boolean(error),
    hasMore,
    totalCount,
    loadMore,
    refetch: () => {
      void refetch();
    },
  };
}
