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
import type { LocationFilters } from "../filters/location-filters";
import { useLocations } from "../hooks/use-locations";
import { LocationCard } from "./location-card";

const SKELETON_COUNT = 9;

interface LocationResultsProps {
  filters: LocationFilters;
  onClearFilters: () => void;
}

export function LocationResults({
  filters,
  onClearFilters,
}: LocationResultsProps) {
  const {
    locations,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
  } = useLocations(filters);

  const state = classifyResultState({
    loading,
    hasError: error,
    itemCount: locations.length,
  });

  const sentinelRef = useIntersectionObserver(loadMore, {
    enabled: state === "success" && hasMore && !loadingMore,
  });

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {state === "loading" && "Loading locations"}
        {state === "error" && "Failed to load locations"}
        {state === "empty" && "No locations found"}
        {state === "success" && `${locations.length} locations loaded`}
        {loadingMore && "Loading more locations"}
      </p>

      {state === "error" && (
        <StatusPanel
          tone="danger"
          icon={<AlertIcon className="h-6 w-6" />}
          heading="Could not load locations."
          description="Check your connection and try again."
          action={<Button onClick={refetch}>Retry</Button>}
        />
      )}

      {state === "empty" && (
        <StatusPanel
          tone="brand"
          icon={<EmptyIcon className="h-6 w-6" />}
          heading="No locations match that search."
          description="Try a different name, type, or dimension, or clear your filters to see every location."
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
                {formatNumber(locations.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {formatNumber(totalCount)}
              </span>{" "}
              locations
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {state === "loading"
              ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <SkeletonCard key={index} variant="banner" />
                ))
              : locations.map((location) => (
                  <LocationCard key={location.id} location={location} />
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
                  Loading more locations&hellip;
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
