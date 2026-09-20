"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchIcon } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSyncedInput } from "@/hooks/use-synced-input";
import type { EpisodeFilters } from "../filters/episode-filters";

const DEBOUNCE_MS = 300;

interface EpisodeFilterBarProps {
  filters: EpisodeFilters;
  onFiltersChange: (patch: Partial<EpisodeFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function EpisodeFilterBar({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: EpisodeFilterBarProps) {
  const [nameInput, setNameInput] = useSyncedInput(filters.name);
  const [codeInput, setCodeInput] = useSyncedInput(filters.code);

  const debouncedName = useDebouncedValue(nameInput, DEBOUNCE_MS);
  const debouncedCode = useDebouncedValue(codeInput, DEBOUNCE_MS);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFiltersChange({ name: debouncedName, code: debouncedCode });
  }, [debouncedName, debouncedCode, onFiltersChange]);

  return (
    <Card className="sticky top-16 z-5 flex flex-col gap-4 bg-background/85 p-4 backdrop-blur-md">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="episode-search" className="sr-only">
          Search by name
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            id="episode-search"
            type="search"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Search episodes…"
            autoComplete="off"
            className="w-full rounded-control border border-border bg-background py-2.5 pr-4 pl-10 text-body text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-48">
          <label
            htmlFor="episode-code"
            className="text-caption font-medium text-foreground-muted"
          >
            Episode code
          </label>
          <input
            id="episode-code"
            type="text"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            placeholder="e.g. S01E01"
            className="w-full rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
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
              : "Showing every episode"}
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
    </Card>
  );
}
