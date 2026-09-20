"use client";

import { useLocationFilters } from "../hooks/use-location-filters";
import { LocationFilterBar } from "./location-filter-bar";
import { LocationResults } from "./location-results";

export function LocationBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useLocationFilters();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display font-bold text-foreground">Locations</h1>
        <p className="text-body text-foreground-muted">
          Search locations by name, type, or dimension.
        </p>
      </div>
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
