"use client";

import type { CharacterFilters } from "../filters/character-filters";

export const LEGACY_SAVED_FILTERS_KEY =
  "multiverse-explorer.saved-character-filters";

export interface LegacySavedCharacterFilter {
  id: string;
  name: string;
  filters: CharacterFilters;
}

function isLegacySavedFilter(
  value: unknown,
): value is LegacySavedCharacterFilter {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LegacySavedCharacterFilter>;
  const filters = item.filters as Partial<CharacterFilters> | undefined;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    filters !== undefined &&
    Array.isArray(filters.statuses) &&
    typeof filters.sort === "string"
  );
}

export function readLegacySavedFilters(): LegacySavedCharacterFilter[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(LEGACY_SAVED_FILTERS_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isLegacySavedFilter) : [];
  } catch {
    return [];
  }
}

export function clearLegacySavedFilters() {
  localStorage.removeItem(LEGACY_SAVED_FILTERS_KEY);
}
