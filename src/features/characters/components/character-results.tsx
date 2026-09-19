"use client";

import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { classifyResultState } from "@/lib/classify-result-state";
import type { CharacterFilters } from "../filters/character-filters";
import { useCharacters } from "../hooks/use-characters";
import { CharacterCard } from "./character-card";

const SKELETON_COUNT = 8;

interface CharacterResultsProps {
  filters: CharacterFilters;
  onClearFilters: () => void;
}

export function CharacterResults({
  filters,
  onClearFilters,
}: CharacterResultsProps) {
  const { characters, loading, error, refetch } = useCharacters(filters);

  const state = classifyResultState({
    loading,
    hasError: error,
    itemCount: characters.length,
  });

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" && "Loading characters"}
        {state === "error" && "Failed to load characters"}
        {state === "empty" && "No characters found"}
        {state === "success" && `${characters.length} characters loaded`}
      </p>

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-body text-foreground">
            We couldn&apos;t load characters right now.
          </p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      )}

      {state === "empty" && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-body text-foreground">
            No characters match your search.
          </p>
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {(state === "loading" || state === "success") && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {state === "loading"
            ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : characters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
        </div>
      )}
    </>
  );
}
