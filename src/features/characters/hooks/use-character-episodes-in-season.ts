"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { normalizeText } from "@/lib/normalize-text";
import { GetCharacterEpisodesInSeasonQuery } from "../api/get-character-episodes-in-season";
import type { CharacterEpisode } from "../domain/character-detail";

const FIRST_PAGE = 1;

interface UseCharacterEpisodesInSeasonResult {
  episodes: CharacterEpisode[];
  loading: boolean;
  error: boolean;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  refetch: () => void;
}

/**
 * Fetches one character's episodes for a single season, one page at a
 * time (see `Character.episodesInSeason` in the BFF schema) -- `enabled`
 * should track whether that season's panel is actually expanded, so a
 * season never opened costs nothing.
 *
 * Each page is its own cache entry (no custom merge policy needed, unlike
 * the app's other "Load more"-style lists): moving to a page already
 * visited reads back from cache instantly, with no refetch, and moving to
 * a new one fetches just that page rather than accumulating every page
 * seen so far.
 */
export function useCharacterEpisodesInSeason(
  characterId: string,
  season: number | null,
  enabled: boolean,
): UseCharacterEpisodesInSeasonResult {
  const [page, setPage] = useState(FIRST_PAGE);

  const { data, loading, error, refetch } = useQuery(
    GetCharacterEpisodesInSeasonQuery,
    {
      variables: { id: characterId, season, page },
      skip: !enabled,
      notifyOnNetworkStatusChange: true,
    },
  );

  const pageData = data?.character?.episodesInSeason;

  const episodes = useMemo(() => {
    const results = pageData?.results ?? [];
    return results
      .filter((episode) => episode !== null && episode !== undefined)
      .map((episode) => ({
        id: episode.id ?? "",
        name: normalizeText(episode.name),
        code: normalizeText(episode.episode),
        airDate: normalizeText(episode.air_date),
      }));
  }, [pageData]);

  const hasPrevPage = (pageData?.info?.prev ?? null) !== null;
  const hasNextPage = (pageData?.info?.next ?? null) !== null;
  const totalPages = pageData?.info?.pages ?? 1;

  const goToPrevPage = useCallback(() => {
    setPage((current) => (hasPrevPage ? current - 1 : current));
  }, [hasPrevPage]);

  const goToNextPage = useCallback(() => {
    setPage((current) => (hasNextPage ? current + 1 : current));
  }, [hasNextPage]);

  return {
    episodes,
    loading: enabled && loading,
    error: Boolean(error),
    page,
    totalPages,
    hasPrevPage,
    hasNextPage,
    goToPrevPage,
    goToNextPage,
    refetch: () => {
      void refetch();
    },
  };
}
