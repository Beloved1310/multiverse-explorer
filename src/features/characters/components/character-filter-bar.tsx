"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSyncedInput } from "@/hooks/use-synced-input";
import {
  CHARACTER_GENDER_OPTIONS,
  CHARACTER_SPECIES_OPTIONS,
  CHARACTER_STATUS_OPTIONS,
  GENDER_LABELS,
  STATUS_LABELS,
  type CharacterFilters,
} from "../filters/character-filters";
import type { SavedCharacterFilter } from "../hooks/use-saved-character-filters";

const DEBOUNCE_MS = 300;

const SELECT_CLASSES =
  "w-full appearance-none rounded-control border border-border bg-background py-2 pl-3 pr-9 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

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
  const [savedName, setSavedName] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  // Commit the debounced value to the URL via replace, not push, so
  // keystrokes never flood browser history.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFiltersChange({ name: debouncedName });
  }, [debouncedName, onFiltersChange]);

  const saveCurrentFilter = () => {
    if (onSaveFilter(savedName, filters)) setSavedName("");
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied");
    } catch {
      setShareMessage("Copy the page address to share this search");
    }
  };

  return (
    <Card className="sticky top-16 z-5 flex flex-col gap-4 border-brand/15 bg-background/95 p-3 shadow-md backdrop-blur-md sm:p-4">
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

      <div className="flex flex-wrap items-end gap-4">
        <fieldset className="flex min-w-52 flex-1 flex-col gap-1.5 sm:flex-none">
          <legend className="text-caption font-medium text-foreground-muted">
            Status
          </legend>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {CHARACTER_STATUS_OPTIONS.map((status) => {
              const isChecked = filters.statuses.includes(status);
              return (
                <label
                  key={status}
                  className="inline-flex items-center gap-1.5 text-caption text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      onFiltersChange({
                        statuses: isChecked
                          ? filters.statuses.filter((item) => item !== status)
                          : [...filters.statuses, status],
                      })
                    }
                    className="h-4 w-4 rounded border-border text-brand focus-visible:ring-2 focus-visible:ring-brand"
                  />
                  {STATUS_LABELS[status]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex min-w-36 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-40">
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

        <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-48">
          <label
            htmlFor="character-dimension"
            className="text-caption font-medium text-foreground-muted"
          >
            Dimension
          </label>
          <input
            id="character-dimension"
            value={filters.dimension}
            onChange={(event) =>
              onFiltersChange({ dimension: event.target.value })
            }
            placeholder="For example C-137"
            className={SELECT_CLASSES}
          />
        </div>

        <div className="flex min-w-32 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-36">
          <label
            htmlFor="character-min-episodes"
            className="text-caption font-medium text-foreground-muted"
          >
            Minimum episodes
          </label>
          <input
            id="character-min-episodes"
            type="number"
            min="0"
            inputMode="numeric"
            value={filters.minEpisodes}
            onChange={(event) =>
              onFiltersChange({ minEpisodes: event.target.value })
            }
            className={SELECT_CLASSES}
          />
        </div>

        <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-48">
          <label
            htmlFor="character-sort"
            className="text-caption font-medium text-foreground-muted"
          >
            Sort by
          </label>
          <div className="relative">
            <select
              id="character-sort"
              value={filters.sort}
              onChange={(event) =>
                onFiltersChange({
                  sort: event.target.value as CharacterFilters["sort"],
                })
              }
              className={SELECT_CLASSES}
            >
              <option value="name-asc">Name, A to Z</option>
              <option value="name-desc">Name, Z to A</option>
              <option value="episodes-desc">Most episodes</option>
              <option value="episodes-asc">Fewest episodes</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          </div>
        </div>

        <div className="flex min-w-36 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-40">
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

        <div className="flex w-full items-center justify-between gap-3 border-t border-border pt-3 sm:ml-auto sm:w-auto sm:border-0 sm:pt-0">
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
              : "All characters"}
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

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-44 flex-1">
            <label htmlFor="saved-filter-name" className="sr-only">
              Saved search name
            </label>
            <input
              id="saved-filter-name"
              value={savedName}
              onChange={(event) => setSavedName(event.target.value)}
              placeholder="Name this search"
              className={SELECT_CLASSES}
            />
          </div>
          <Button
            variant="secondary"
            onClick={saveCurrentFilter}
            disabled={activeFilterCount === 0 || !savedName.trim()}
          >
            Save search
          </Button>
          <Button variant="secondary" onClick={() => void copyShareLink()}>
            Copy link
          </Button>
          <span
            className="min-h-5 text-caption text-foreground-muted"
            aria-live="polite"
          >
            {shareMessage}
          </span>
        </div>

        {savedFilters.length > 0 && (
          <div aria-label="Saved searches" className="flex flex-wrap gap-2">
            {savedFilters.map((savedFilter) => (
              <div
                key={savedFilter.id}
                className="inline-flex overflow-hidden rounded-control border border-border"
              >
                <button
                  type="button"
                  onClick={() => onFiltersChange(savedFilter.filters)}
                  className="px-3 py-1.5 text-caption font-medium text-foreground hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                >
                  {savedFilter.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSavedFilter(savedFilter.id)}
                  aria-label={`Delete saved search ${savedFilter.name}`}
                  className="border-l border-border px-2 text-caption text-foreground-muted hover:bg-surface-elevated hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
