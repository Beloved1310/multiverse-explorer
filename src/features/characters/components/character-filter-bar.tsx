"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchIcon } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSyncedInput } from "@/hooks/use-synced-input";
import type { CharacterFilters } from "../filters/character-filters";
import type { SavedCharacterFilter } from "../hooks/use-saved-character-filters";
import { CharacterFilterControls } from "./character-filter-controls";
import { SavedCharacterFilterControls } from "./saved-character-filter-controls";

const DEBOUNCE_MS = 300;

interface CharacterFilterBarProps {
  filters: CharacterFilters;
  onFiltersChange: (patch: Partial<CharacterFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  savedFilters: SavedCharacterFilter[];
  onSaveFilter: (name: string, filters: CharacterFilters) => boolean;
  onDeleteSavedFilter: (id: string) => void;
}

export function CharacterFilterBar({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  savedFilters,
  onSaveFilter,
  onDeleteSavedFilter,
}: CharacterFilterBarProps) {
  const [nameInput, setNameInput] = useSyncedInput(filters.name);
  const debouncedName = useDebouncedValue(nameInput, DEBOUNCE_MS);
  const isFirstRender = useRef(true);
  const [filtersOpen, setFiltersOpen] = useState(activeFilterCount > 0);
  const filterPanelId = useId();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFiltersChange({ name: debouncedName });
  }, [debouncedName, onFiltersChange]);

  return (
    <Card className="sticky top-16 z-5 flex flex-col gap-3 border-brand/15 bg-background/95 p-3 shadow-md backdrop-blur-md sm:p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="character-search" className="sr-only">
          Search by name
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            id="character-search"
            type="search"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Search characters…"
            autoComplete="off"
            className="w-full rounded-control border border-border bg-background py-3 pr-4 pl-10 text-body text-foreground shadow-sm placeholder:text-foreground-muted/75 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={filterPanelId}
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-control px-2 py-1.5 text-body font-medium text-foreground hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          Filters and sort
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-subtle px-1.5 text-[0.7rem] font-semibold text-brand">
              {activeFilterCount}
            </span>
          )}
          <span aria-hidden="true" className="text-brand">
            {filtersOpen ? "−" : "+"}
          </span>
        </button>
        {!filtersOpen && activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-control px-2 py-1.5 text-caption font-medium text-brand hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            Clear filters
          </button>
        )}
      </div>
      <div
        id={filterPanelId}
        hidden={!filtersOpen}
        className="space-y-4 border-t border-border pt-4"
      >
        <CharacterFilterControls
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
          activeFilterCount={activeFilterCount}
        />
        <SavedCharacterFilterControls
          filters={filters}
          activeFilterCount={activeFilterCount}
          savedFilters={savedFilters}
          onFiltersChange={onFiltersChange}
          onSaveFilter={onSaveFilter}
          onDeleteSavedFilter={onDeleteSavedFilter}
        />
      </div>
    </Card>
  );
}
