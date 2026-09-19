"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GetCharactersQuery } from "../api/get-characters";
import { mapCharacter } from "../mapping/map-character";
import type { Character } from "../domain/character";

interface UseCharactersResult {
  characters: Character[];
  loading: boolean;
  error: boolean;
}

/** Fetches page one of characters and returns them mapped to our domain type. */
export function useCharacters(): UseCharactersResult {
  const { data, loading, error } = useQuery(GetCharactersQuery);

  const characters = useMemo(() => {
    const results = data?.characters?.results ?? [];
    return results.filter((result) => result !== null).map(mapCharacter);
  }, [data]);

  return {
    characters,
    loading,
    error: Boolean(error),
  };
}
