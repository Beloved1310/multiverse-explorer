import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSavedCharacterFilters } from "@/features/characters/hooks/use-saved-character-filters";
import { EMPTY_CHARACTER_FILTERS } from "@/features/characters/filters/character-filters";

const STORAGE_KEY = "multiverse-explorer.saved-character-filters";

describe("useSavedCharacterFilters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty, then loads previously saved filters from storage", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "1", name: "Alive humans", filters: EMPTY_CHARACTER_FILTERS },
      ]),
    );

    const { result } = renderHook(() => useSavedCharacterFilters());
    expect(result.current.savedFilters).toEqual([]);

    await waitFor(() => expect(result.current.savedFilters).toHaveLength(1));
    expect(result.current.savedFilters.at(0)?.name).toBe("Alive humans");
  });

  it("treats corrupted storage as no saved filters instead of crashing", async () => {
    localStorage.setItem(STORAGE_KEY, "not valid json");

    const { result } = renderHook(() => useSavedCharacterFilters());
    await waitFor(() => expect(result.current.savedFilters).toEqual([]));
  });

  it("drops stored entries that don't match the expected shape", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "1", name: "Valid", filters: EMPTY_CHARACTER_FILTERS },
        { id: "2", name: "Missing filters" },
        { notEven: "an entry" },
      ]),
    );

    const { result } = renderHook(() => useSavedCharacterFilters());
    await waitFor(() => expect(result.current.savedFilters).toHaveLength(1));
    expect(result.current.savedFilters.at(0)?.id).toBe("1");
  });

  it("saves a named filter, assigns it an id, and persists it to storage", async () => {
    const { result } = renderHook(() => useSavedCharacterFilters());
    await waitFor(() => expect(result.current.savedFilters).toEqual([]));

    act(() => {
      const saved = result.current.saveFilter("My filter", {
        ...EMPTY_CHARACTER_FILTERS,
        name: "rick",
      });
      expect(saved).toBe(true);
    });

    expect(result.current.savedFilters).toHaveLength(1);
    expect(result.current.savedFilters[0]).toMatchObject({
      name: "My filter",
      filters: { name: "rick" },
    });
    expect(result.current.savedFilters.at(0)?.id).toEqual(expect.any(String));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
  });

  it("trims the saved name and rejects a blank name without saving", async () => {
    const { result } = renderHook(() => useSavedCharacterFilters());
    await waitFor(() => expect(result.current.savedFilters).toEqual([]));

    act(() => {
      const saved = result.current.saveFilter("   ", EMPTY_CHARACTER_FILTERS);
      expect(saved).toBe(false);
    });
    expect(result.current.savedFilters).toEqual([]);

    act(() => {
      result.current.saveFilter("  Padded  ", EMPTY_CHARACTER_FILTERS);
    });
    expect(result.current.savedFilters.at(0)?.name).toBe("Padded");
  });

  it("deletes a saved filter by id", async () => {
    const { result } = renderHook(() => useSavedCharacterFilters());
    await waitFor(() => expect(result.current.savedFilters).toEqual([]));

    act(() => {
      result.current.saveFilter("Keep", EMPTY_CHARACTER_FILTERS);
    });
    expect(result.current.savedFilters).toHaveLength(1);

    const id = result.current.savedFilters.at(0)?.id;
    expect(id).toEqual(expect.any(String));
    act(() => {
      result.current.deleteFilter(id!);
    });

    expect(result.current.savedFilters).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
  });
});
