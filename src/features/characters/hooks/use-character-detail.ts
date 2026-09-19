"use client";

import { useQuery } from "@apollo/client/react";
import { GetCharacterQuery } from "../api/get-character";
import { mapCharacterDetail } from "../mapping/map-character-detail";
import type { CharacterDetail } from "../domain/character-detail";

interface UseCharacterDetailResult {
  character: CharacterDetail | null;
  loading: boolean;
  error: boolean;
  notFound: boolean;
  refetch: () => void;
}

/**
 * Fetches a single character by id. `returnPartialData` lets whatever's
 * already cached (e.g. name/image from the list this was opened from)
 * render immediately, alongside `loading: true`, while the rest of the
 * query -- fields the list never fetched, like episodes -- is still in
 * flight.
 */
export function useCharacterDetail(id: string): UseCharacterDetailResult {
  const { data, loading, error, refetch } = useQuery(GetCharacterQuery, {
    variables: { id },
    returnPartialData: true,
    notifyOnNetworkStatusChange: true,
  });

  const character = data?.character ? mapCharacterDetail(data.character) : null;

  return {
    character,
    loading,
    error: Boolean(error),
    // The API returns a clean `{ character: null }` (no error) for both a
    // well-formed id that doesn't exist and a malformed one -- verified
    // directly against the live API -- so both collapse into the same
    // "not found" state rather than one showing a scary generic error.
    notFound: !loading && data?.character === null,
    refetch: () => {
      void refetch();
    },
  };
}
