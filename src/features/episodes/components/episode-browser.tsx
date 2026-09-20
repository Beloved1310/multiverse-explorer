"use client";

import { useEpisodeFilters } from "../hooks/use-episode-filters";
import { EpisodeFilterBar } from "./episode-filter-bar";
import { EpisodeResults } from "./episode-results";

export function EpisodeBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useEpisodeFilters();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display font-bold text-foreground">Episodes</h1>
        <p className="text-body text-foreground-muted">
          Every episode the multiverse has aired &mdash; search by name or code.
        </p>
      </div>
      <EpisodeFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
      <EpisodeResults filters={filters} onClearFilters={clearFilters} />
    </div>
  );
}
