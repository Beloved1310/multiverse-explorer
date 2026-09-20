"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CharacterFilters } from "../filters/character-filters";
import type { SavedCharacterFilter } from "../hooks/use-saved-character-filters";

const INPUT_CLASSES =
  "w-full appearance-none rounded-control border border-border bg-background py-2 pl-3 pr-9 text-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

interface SavedCharacterFilterControlsProps {
  filters: CharacterFilters;
  activeFilterCount: number;
  savedFilters: SavedCharacterFilter[];
  onFiltersChange: (patch: Partial<CharacterFilters>) => void;
  onSaveFilter: (name: string, filters: CharacterFilters) => boolean;
  onDeleteSavedFilter: (id: string) => void;
}

export function SavedCharacterFilterControls({
  filters,
  activeFilterCount,
  savedFilters,
  onFiltersChange,
  onSaveFilter,
  onDeleteSavedFilter,
}: SavedCharacterFilterControlsProps) {
  const [savedName, setSavedName] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied");
    } catch {
      setShareMessage("Copy the page address to share this search");
    }
  };
  return (
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
            className={INPUT_CLASSES}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            if (onSaveFilter(savedName, filters)) setSavedName("");
          }}
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
  );
}
