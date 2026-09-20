"use client";

import { useCallback, useEffect, useState } from "react";
import type { CharacterFilters } from "../filters/character-filters";

const STORAGE_KEY = "multiverse-explorer.saved-character-filters";

export interface SavedCharacterFilter {
  id: string;
  name: string;
  filters: CharacterFilters;
}

function isSavedFilter(value: unknown): value is SavedCharacterFilter {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SavedCharacterFilter>;
  const filters = item.filters as Partial<CharacterFilters> | undefined;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    filters !== undefined &&
    Array.isArray(filters.statuses)
  );
}

function readSavedFilters(): SavedCharacterFilter[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isSavedFilter) : [];
  } catch {
    return [];
  }
}

export function useSavedCharacterFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedCharacterFilter[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSavedFilters(readSavedFilters()));
    return () => window.clearTimeout(timer);
  }, []);

  const persist = useCallback((next: SavedCharacterFilter[]) => {
    setSavedFilters(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveFilter = useCallback(
    (name: string, filters: CharacterFilters) => {
      const trimmedName = name.trim();
      if (!trimmedName) return false;

      persist([
        ...savedFilters,
        { id: crypto.randomUUID(), name: trimmedName, filters },
      ]);
      return true;
    },
    [persist, savedFilters],
  );

  const deleteFilter = useCallback(
    (id: string) => persist(savedFilters.filter((item) => item.id !== id)),
    [persist, savedFilters],
  );

  return { savedFilters, saveFilter, deleteFilter };
}
