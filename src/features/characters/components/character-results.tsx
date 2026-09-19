"use client";

import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  EmptyIcon,
  FlagIcon,
  SpinnerIcon,
} from "@/components/ui/icons";
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
    totalCount,
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
      {/* Kept plain and literal for assistive tech -- the visible copy
          below can afford personality because it's read alongside an
          icon and a button that disambiguate tone from meaning; a
          screen reader only gets the words, so those stay unambiguous. */}
      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" && "Loading characters"}
        {state === "error" && "Failed to load characters"}
        {state === "empty" && "No characters found"}
        {state === "success" && `${characters.length} characters loaded`}
        {loadingMore && "Loading more characters"}
      </p>

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-dead-bg text-status-dead-fg">
            <AlertIcon className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-body font-medium text-foreground">
              Something glitched in this dimension.
            </p>
            <p className="text-caption text-foreground-muted">
              We couldn&apos;t reach the multiverse&apos;s database. Check your
              connection and try again.
            </p>
          </div>
          <Button onClick={refetch}>Retry</Button>
        </div>
      )}

      {state === "empty" && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <EmptyIcon className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-body font-medium text-foreground">
              No one matches that search.
            </p>
            <p className="text-caption text-foreground-muted">
              Try a different name, or clear your filters to see everyone.
            </p>
          </div>
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {(state === "loading" || state === "success") && (
        <>
          {state === "success" && totalCount !== null && (
            <p className="mb-4 text-caption text-foreground-muted">
              Showing{" "}
              <span className="font-medium text-foreground">
                {characters.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalCount}</span>{" "}
              beings
            </p>
          )}

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
              className="flex flex-col items-center gap-3 py-10"
            >
              {loadingMore && (
                <p className="flex items-center gap-2 text-caption text-foreground-muted">
                  <SpinnerIcon className="h-4 w-4 text-brand" />
                  Pulling more beings through the portal&hellip;
                </p>
              )}
              {!loadingMore && hasMore && (
                <Button variant="secondary" onClick={loadMore}>
                  Load more
                </Button>
              )}
              {!hasMore && (
                <p className="flex items-center gap-2 text-caption text-foreground-muted">
                  <FlagIcon className="h-4 w-4" />
                  You&apos;ve reached the edge of this reality.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
