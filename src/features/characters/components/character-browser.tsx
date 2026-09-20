"use client";

import { useCharacterFilters } from "../hooks/use-character-filters";
import { CharacterFilterBar } from "./character-filter-bar";
import { CharacterResults } from "./character-results";

export function CharacterBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useCharacterFilters();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display font-bold text-foreground">Characters</h1>
        <p className="text-body text-foreground-muted">
          Every being, every reality &mdash; search and filter the multiverse.
        </p>
      </div>
      <CharacterFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
      <CharacterResults filters={filters} onClearFilters={clearFilters} />
    </div>
  );
}
