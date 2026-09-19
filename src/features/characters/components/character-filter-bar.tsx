"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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

const FIELD_CLASSES =
  "rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

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
    <div className="flex flex-wrap items-end gap-4 border-b border-border pb-6">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="character-search"
          className="text-caption font-medium text-foreground-muted"
        >
          Search by name
        </label>
        <input
          id="character-search"
          type="search"
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="e.g. Rick"
          className={FIELD_CLASSES}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="character-status"
          className="text-caption font-medium text-foreground-muted"
        >
          Status
        </label>
        <select
          id="character-status"
          value={filters.status}
          onChange={(event) => onFiltersChange({ status: event.target.value })}
          className={FIELD_CLASSES}
        >
          <option value="">Any status</option>
          {CHARACTER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="character-species"
          className="text-caption font-medium text-foreground-muted"
        >
          Species
        </label>
        <select
          id="character-species"
          value={filters.species}
          onChange={(event) => onFiltersChange({ species: event.target.value })}
          className={FIELD_CLASSES}
        >
          <option value="">Any species</option>
          {CHARACTER_SPECIES_OPTIONS.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="character-gender"
          className="text-caption font-medium text-foreground-muted"
        >
          Gender
        </label>
        <select
          id="character-gender"
          value={filters.gender}
          onChange={(event) => onFiltersChange({ gender: event.target.value })}
          className={FIELD_CLASSES}
        >
          <option value="">Any gender</option>
          {CHARACTER_GENDER_OPTIONS.map((gender) => (
            <option key={gender} value={gender}>
              {GENDER_LABELS[gender]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-caption text-foreground-muted" aria-live="polite">
          {activeFilterCount > 0
            ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
            : "No active filters"}
        </span>
        <Button
          variant="secondary"
          onClick={onClearFilters}
          disabled={activeFilterCount === 0}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
}
