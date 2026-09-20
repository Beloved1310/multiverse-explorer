"use client";

import { useCharacterFilters } from "../hooks/use-character-filters";
import { useSavedCharacterFilters } from "../hooks/use-saved-character-filters";
import { ExplorerIntro } from "@/components/explorer-intro";
import { CharacterFilterBar } from "./character-filter-bar";
import { CharacterResults } from "./character-results";

export function CharacterBrowser() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useCharacterFilters();
  const { savedFilters, saveFilter, deleteFilter } = useSavedCharacterFilters();

  return (
    <div className="flex flex-col gap-6">
      <ExplorerIntro
        eyebrow="Character archive"
        title="Characters"
        description="Find a character, narrow the universe, or save a search to return to later."
      />
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
