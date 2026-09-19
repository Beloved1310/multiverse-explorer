"use client";

import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
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
  const {
    characters,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useCharacters(filters);

  const state = classifyResultState({
    loading,
    hasError: error,
    itemCount: characters.length,
  });

  // Disconnected (not just ignored) while a fetch is already in flight or
  // there's nothing left to load, so a sentinel that's still on-screen
  // right after a page loads can't immediately re-trigger.
  const sentinelRef = useIntersectionObserver(loadMore, {
    enabled: state === "success" && hasMore && !loadingMore,
  });

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" && "Loading characters"}
        {state === "error" && "Failed to load characters"}
        {state === "empty" && "No characters found"}
        {state === "success" && `${characters.length} characters loaded`}
        {loadingMore && "Loading more characters"}
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
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {state === "loading"
              ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : characters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
          </div>

          {state === "success" && (
            <div
              ref={sentinelRef}
              className="flex flex-col items-center gap-3 py-8"
            >
              {loadingMore && (
                <p className="text-caption text-foreground-muted">
                  Loading more characters&hellip;
                </p>
              )}
              {!loadingMore && hasMore && (
                <Button variant="secondary" onClick={loadMore}>
                  Load more
                </Button>
              )}
              {!hasMore && (
                <p className="text-caption text-foreground-muted">
                  You&apos;ve reached the end of the list.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
