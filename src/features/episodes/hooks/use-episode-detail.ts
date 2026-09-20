"use client";

import { useQuery } from "@apollo/client/react";
import { GetEpisodeQuery } from "../api/get-episode";
import { mapEpisodeDetail } from "../mapping/map-episode-detail";
import type { EpisodeDetail } from "../domain/episode-detail";

interface UseEpisodeDetailResult {
  episode: EpisodeDetail | null;
  loading: boolean;
  error: boolean;
  notFound: boolean;
  refetch: () => void;
}

/**
 * `returnPartialData` lets whatever's already cached (e.g. name/code from
 * the list this was opened from) render immediately, alongside
 * `loading: true`, while the rest of the query -- the full character
 * cast -- is still in flight. Mirrors useCharacterDetail.
 */
export function useEpisodeDetail(id: string): UseEpisodeDetailResult {
  const { data, loading, error, refetch } = useQuery(GetEpisodeQuery, {
    variables: { id },
    returnPartialData: true,
    notifyOnNetworkStatusChange: true,
  });

  const episode = data?.episode ? mapEpisodeDetail(data.episode) : null;

  return {
    episode,
    loading,
    error: Boolean(error),
    notFound: !loading && data?.episode === null,
    refetch: () => {
      void refetch();
    },
  };
}
