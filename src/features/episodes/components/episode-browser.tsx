"use client";

import { useEpisodeFilters } from "../hooks/use-episode-filters";
import { ExplorerIntro } from "@/components/explorer-intro";
import { EpisodeFilterBar } from "./episode-filter-bar";
import { EpisodeResults } from "./episode-results";

export function EpisodeBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useEpisodeFilters();

  return (
    <div className="flex flex-col gap-6">
      <ExplorerIntro
        eyebrow="Episode guide"
        title="Episodes"
        description="Browse every episode by title or production code, organised by season."
      />
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
