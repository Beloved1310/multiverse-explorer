"use client";

import { useCharacterFilters } from "../hooks/use-character-filters";
import { CharacterFilterBar } from "./character-filter-bar";
import { CharacterResults } from "./character-results";

export function CharacterBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useCharacterFilters();

  return (
    <div className="flex flex-col gap-6">
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
