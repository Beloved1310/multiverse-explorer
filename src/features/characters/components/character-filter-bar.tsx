"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  CHARACTER_GENDER_OPTIONS,
  CHARACTER_SPECIES_OPTIONS,
  CHARACTER_STATUS_OPTIONS,
  GENDER_LABELS,
  STATUS_LABELS,
  type CharacterFilters,
} from "../filters/character-filters";

const DEBOUNCE_MS = 300;

const SELECT_CLASSES =
  "w-full appearance-none rounded-control border border-border bg-background py-2 pl-3 pr-9 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

interface CharacterFilterBarProps {
  filters: CharacterFilters;
  onFiltersChange: (patch: Partial<CharacterFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function CharacterFilterBar({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: CharacterFilterBarProps) {
  const [nameInput, setNameInput] = useState(filters.name);
  // Tracks the last URL-derived name we've synced from, so we can tell
  // "the URL changed externally" (back/forward, Clear all) apart from
  // "we're the ones who just wrote this value". Adjusting state during
  // render like this -- rather than in an effect -- is the pattern React
  // itself recommends for syncing local state to a changed prop.
  const [syncedName, setSyncedName] = useState(filters.name);
  if (filters.name !== syncedName) {
    setSyncedName(filters.name);
    setNameInput(filters.name);
  }

  const debouncedName = useDebouncedValue(nameInput, DEBOUNCE_MS);
  const isFirstRender = useRef(true);

  // Commit the debounced value to the URL via replace, not push, so
  // keystrokes never flood browser history.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFiltersChange({ name: debouncedName });
  }, [debouncedName, onFiltersChange]);

  return (
    <Card className="sticky top-22.5 z-5 flex flex-wrap items-end gap-4 bg-background/85 p-4 backdrop-blur-md">
      <div className="flex min-w-48 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-56">
        <label
          htmlFor="character-search"
          className="text-caption font-medium text-foreground-muted"
        >
          Search by name
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            id="character-search"
            type="search"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Try “Rick” or “Morty”"
            className="w-full rounded-control border border-border bg-background py-2 pr-3 pl-9 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="character-status"
          className="text-caption font-medium text-foreground-muted"
        >
          Status
        </label>
        <div className="relative">
          <select
            id="character-status"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({ status: event.target.value })
            }
            className={SELECT_CLASSES}
          >
            <option value="">Any status</option>
            {CHARACTER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="character-species"
          className="text-caption font-medium text-foreground-muted"
        >
          Species
        </label>
        <div className="relative">
          <select
            id="character-species"
            value={filters.species}
            onChange={(event) =>
              onFiltersChange({ species: event.target.value })
            }
            className={SELECT_CLASSES}
          >
            <option value="">Any species</option>
            {CHARACTER_SPECIES_OPTIONS.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="character-gender"
          className="text-caption font-medium text-foreground-muted"
        >
          Gender
        </label>
        <div className="relative">
          <select
            id="character-gender"
            value={filters.gender}
            onChange={(event) =>
              onFiltersChange({ gender: event.target.value })
            }
            className={SELECT_CLASSES}
          >
            <option value="">Any gender</option>
            {CHARACTER_GENDER_OPTIONS.map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 text-caption text-foreground-muted"
          aria-live="polite"
        >
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-subtle px-1.5 text-[0.7rem] font-semibold text-brand">
              {activeFilterCount}
            </span>
          )}
          {activeFilterCount > 0
            ? `filter${activeFilterCount === 1 ? "" : "s"} applied`
            : "Showing the full multiverse"}
        </span>
        <Button
          variant="secondary"
          onClick={onClearFilters}
          disabled={activeFilterCount === 0}
        >
          Clear all
        </Button>
      </div>
    </Card>
  );
}
