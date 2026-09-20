"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchIcon } from "@/components/ui/icons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSyncedInput } from "@/hooks/use-synced-input";
import type { LocationFilters } from "../filters/location-filters";

const DEBOUNCE_MS = 300;

interface LocationFilterBarProps {
  filters: LocationFilters;
  onFiltersChange: (patch: Partial<LocationFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function LocationFilterBar({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: LocationFilterBarProps) {
  const [nameInput, setNameInput] = useSyncedInput(filters.name);
  const [typeInput, setTypeInput] = useSyncedInput(filters.type);
  const [dimensionInput, setDimensionInput] = useSyncedInput(filters.dimension);

  const debouncedName = useDebouncedValue(nameInput, DEBOUNCE_MS);
  const debouncedType = useDebouncedValue(typeInput, DEBOUNCE_MS);
  const debouncedDimension = useDebouncedValue(dimensionInput, DEBOUNCE_MS);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFiltersChange({
      name: debouncedName,
      type: debouncedType,
      dimension: debouncedDimension,
    });
  }, [debouncedName, debouncedType, debouncedDimension, onFiltersChange]);

  return (
    <Card className="sticky top-16 z-5 flex flex-col gap-4 border-brand/15 bg-background/95 p-3 shadow-md backdrop-blur-md sm:p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="location-search" className="sr-only">
          Search by name
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            id="location-search"
            type="search"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Search locations…"
            autoComplete="off"
            className="w-full rounded-control border border-border bg-background py-3 pr-4 pl-10 text-body text-foreground shadow-sm placeholder:text-foreground-muted/75 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-48">
          <label
            htmlFor="location-type"
            className="text-caption font-medium text-foreground-muted"
          >
            Type
          </label>
          <input
            id="location-type"
            type="text"
            value={typeInput}
            onChange={(event) => setTypeInput(event.target.value)}
            placeholder="e.g. Planet"
            className="w-full rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
        </div>

        <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:flex-none sm:basis-48">
          <label
            htmlFor="location-dimension"
            className="text-caption font-medium text-foreground-muted"
          >
            Dimension
          </label>
          <input
            id="location-dimension"
            type="text"
            value={dimensionInput}
            onChange={(event) => setDimensionInput(event.target.value)}
            placeholder="e.g. C-137"
            className="w-full rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          />
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
              : "All locations"}
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
