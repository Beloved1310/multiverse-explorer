"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GetEpisodesQuery } from "../api/get-episodes";
import { mapEpisode } from "../mapping/map-episode";
import type { Episode } from "../domain/episode";
import {
  toGraphQLEpisodeFilter,
  type EpisodeFilters,
} from "../filters/episode-filters";

const FIRST_PAGE = 1;

interface UseEpisodesResult {
  episodes: Episode[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  totalCount: number | null;
  loadMore: () => void;
  refetch: () => void;
}

/** Fetches episodes matching `filters`, paginated, mapped to our domain type. */
export function useEpisodes(filters: EpisodeFilters): UseEpisodesResult {
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetchingMoreRef = useRef(false);

  const { data, loading, error, refetch, fetchMore } = useQuery(
    GetEpisodesQuery,
    {
      variables: {
        filter: toGraphQLEpisodeFilter(filters),
        page: FIRST_PAGE,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const episodes = useMemo(() => {
    const results = data?.episodes?.results ?? [];
    return results.filter((result) => result !== null).map(mapEpisode);
  }, [data]);

  const nextPage = data?.episodes?.info?.next ?? null;
  const hasMore = nextPage !== null;
  const totalCount = data?.episodes?.info?.count ?? null;

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
    episodes,
    loading: loading && episodes.length === 0,
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
