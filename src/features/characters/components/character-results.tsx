"use client";

import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  EmptyIcon,
  FlagIcon,
  SpinnerIcon,
} from "@/components/ui/icons";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { StatusPanel } from "@/components/ui/status-panel";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { classifyResultState } from "@/lib/classify-result-state";
import { formatNumber } from "@/lib/format";
import type { CharacterFilters } from "../filters/character-filters";
import { useCharacters } from "../hooks/use-characters";
import { CharacterCard } from "./character-card";

const SKELETON_COUNT = 9;

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
        <StatusPanel
          tone="danger"
          icon={<AlertIcon className="h-6 w-6" />}
          heading="Something glitched in this dimension."
          description="We couldn't reach the multiverse's database. Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      )}

      {state === "empty" && (
        <StatusPanel
          tone="brand"
          icon={<EmptyIcon className="h-6 w-6" />}
          heading="No one matches that search."
          description="Try a different name, or clear your filters to see everyone."
          action={
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {(state === "loading" || state === "success") && (
        <>
          {state === "success" && totalCount !== null && (
            <p className="mb-4 text-caption text-foreground-muted">
              Showing{" "}
              <span className="font-medium text-foreground">
                {formatNumber(characters.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {formatNumber(totalCount)}
              </span>{" "}
              beings
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
