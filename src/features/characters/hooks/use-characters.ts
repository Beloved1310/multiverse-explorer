"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GetCharactersQuery } from "../api/get-characters";
import { mapCharacter } from "../mapping/map-character";
import type { Character } from "../domain/character";
import {
  toGraphQLCharacterFilter,
  toGraphQLCharacterSort,
  type CharacterFilters,
} from "../filters/character-filters";

const FIRST_PAGE = 1;

interface UseCharactersResult {
  characters: Character[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  totalCount: number | null;
  loadMore: () => void;
  refetch: () => void;
}

/** Fetches characters matching `filters`, paginated, mapped to our domain type. */
export function useCharacters(filters: CharacterFilters): UseCharactersResult {
  const [loadingMore, setLoadingMore] = useState(false);
  // Synchronous guard: IntersectionObserver can fire multiple times before
  // a re-render disables it (e.g. the sentinel is still on-screen right
  // after a page loads), so `loadingMore` state alone isn't fast enough to
  // stop a second call in the same tick.
  const isFetchingMoreRef = useRef(false);

  const { data, loading, error, refetch, fetchMore } = useQuery(
    GetCharactersQuery,
    {
      variables: {
        filter: toGraphQLCharacterFilter(filters),
        page: FIRST_PAGE,
        sort: toGraphQLCharacterSort(filters.sort),
      },
      // re-flags `loading` during a retry, so the UI can fall back to the
      // same skeleton state rather than needing a separate "retrying" state
      notifyOnNetworkStatusChange: true,
    },
  );

  const characters = useMemo(() => {
    const results = data?.characters?.results ?? [];
    return results.filter((result) => result !== null).map(mapCharacter);
  }, [data]);

  const nextPage = data?.characters?.info?.next ?? null;
  const hasMore = nextPage !== null;
  const totalCount = data?.characters?.info?.count ?? null;

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
    characters,
    // Only "true initial load, no data yet" counts as the full-page
    // loading state -- Apollo's own `loading` flag isn't relied on here
    // to distinguish that from a fetchMore in flight, so the grid never
    // gets replaced with skeletons while paginating.
    loading: loading && characters.length === 0,
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
