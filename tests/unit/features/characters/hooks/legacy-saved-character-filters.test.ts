import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLegacySavedFilters,
  LEGACY_SAVED_FILTERS_KEY,
  readLegacySavedFilters,
} from "@/features/characters/hooks/legacy-saved-character-filters";
import { EMPTY_CHARACTER_FILTERS } from "@/features/characters/filters/character-filters";

describe("legacy saved-filter import source", () => {
  beforeEach(() => localStorage.clear());

  it("reads only valid old saved filters", () => {
    localStorage.setItem(
      LEGACY_SAVED_FILTERS_KEY,
      JSON.stringify([
        { id: "old-1", name: "Alive humans", filters: EMPTY_CHARACTER_FILTERS },
        { id: "broken", name: "Missing filter" },
      ]),
    );

    expect(readLegacySavedFilters()).toEqual([
      { id: "old-1", name: "Alive humans", filters: EMPTY_CHARACTER_FILTERS },
    ]);
  });

  it("keeps corrupt browser data harmless and removes it only on request", () => {
    localStorage.setItem(LEGACY_SAVED_FILTERS_KEY, "not valid json");
    expect(readLegacySavedFilters()).toEqual([]);

    localStorage.setItem(LEGACY_SAVED_FILTERS_KEY, "[]");
    clearLegacySavedFilters();
    expect(localStorage.getItem(LEGACY_SAVED_FILTERS_KEY)).toBeNull();
  });
});
