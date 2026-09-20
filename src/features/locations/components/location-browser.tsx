"use client";

import { useLocationFilters } from "../hooks/use-location-filters";
import { ExplorerIntro } from "@/components/explorer-intro";
import { LocationFilterBar } from "./location-filter-bar";
import { LocationResults } from "./location-results";

export function LocationBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useLocationFilters();

  return (
    <div className="flex flex-col gap-6">
      <ExplorerIntro
        eyebrow="Place index"
        title="Locations"
        description="Explore places by name, type, and dimension, then discover who is connected to each one."
      />
      <LocationFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
      <LocationResults filters={filters} onClearFilters={clearFilters} />
    </div>
  );
}
