"use client";

import { useCharacterFilters } from "../hooks/use-character-filters";
import { useSavedCharacterFilters } from "../hooks/use-saved-character-filters";
import { CharacterFilterBar } from "./character-filter-bar";
import { CharacterResults } from "./character-results";

export function CharacterBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useCharacterFilters();
  const { savedFilters, saveFilter, deleteFilter } = useSavedCharacterFilters();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-display font-bold text-foreground">Characters</h1>
        <p className="text-body text-foreground-muted">
          Search and filter characters.
        </p>
      </div>
      <CharacterFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        savedFilters={savedFilters}
        onSaveFilter={saveFilter}
        onDeleteSavedFilter={deleteFilter}
      />
      <CharacterResults
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
