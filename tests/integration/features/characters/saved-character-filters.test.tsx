import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GetSavedCharacterFiltersQuery,
  ImportSavedCharacterFiltersMutation,
} from "@/features/characters/api/saved-character-filters";
import { LEGACY_SAVED_FILTERS_KEY } from "@/features/characters/hooks/legacy-saved-character-filters";
import { useSavedCharacterFilters } from "@/features/characters/hooks/use-saved-character-filters";
import { EMPTY_CHARACTER_FILTERS } from "@/features/characters/filters/character-filters";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "user-1", name: "Ayo", email: "ayo@example.com" } },
      isPending: false,
    }),
  },
}));

const savedFilter = {
  id: "server-filter-1",
  name: "Alive people",
  filter: {
    name: "",
    statuses: ["alive"],
    species: "",
    gender: "",
    dimension: "",
    minEpisodes: null,
    sort: { field: "NAME", direction: "ASC" },
  },
};

function wrapper(
  mocks: ConstructorParameters<typeof MockedProvider>[0]["mocks"],
) {
  return function ApolloWrapper({ children }: PropsWithChildren) {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
  };
}

describe("account-backed saved filters", () => {
  beforeEach(() => localStorage.clear());

  it("loads saved searches from GraphQL, not localStorage", async () => {
    const { result } = renderHook(() => useSavedCharacterFilters(), {
      wrapper: wrapper([
        {
          request: { query: GetSavedCharacterFiltersQuery },
          result: { data: { savedCharacterFilters: [savedFilter] } },
        },
      ]),
    });

    await waitFor(() => expect(result.current.savedFilters).toHaveLength(1));
    expect(result.current.savedFilters[0]).toMatchObject({
      id: "server-filter-1",
      filters: { statuses: ["alive"], sort: "name-asc" },
    });
  });

  it("keeps legacy browser data when the one-time import fails", async () => {
    localStorage.setItem(
      LEGACY_SAVED_FILTERS_KEY,
      JSON.stringify([
        { id: "old-1", name: "Old search", filters: EMPTY_CHARACTER_FILTERS },
      ]),
    );
    const { result } = renderHook(() => useSavedCharacterFilters(), {
      wrapper: wrapper([
        {
          request: { query: GetSavedCharacterFiltersQuery },
          result: { data: { savedCharacterFilters: [] } },
        },
        {
          request: {
            query: ImportSavedCharacterFiltersMutation,
            variables: {
              inputs: [
                {
                  name: "Old search",
                  filter: {
                    name: null,
                    statuses: [],
                    species: null,
                    gender: null,
                    dimension: null,
                    minEpisodes: null,
                    sort: { field: "NAME", direction: "ASC" },
                  },
                },
              ],
            },
          },
          error: new Error("Database unavailable"),
        },
      ]),
    });

    await waitFor(() => expect(result.current.legacyFilterCount).toBe(1));
    await act(async () => result.current.importLegacyFilters());

    expect(localStorage.getItem(LEGACY_SAVED_FILTERS_KEY)).not.toBeNull();
    expect(result.current.error).toContain("Database unavailable");
  });

  it("removes legacy browser data only after the import succeeds", async () => {
    const legacy = {
      id: "old-1",
      name: "Alive people",
      filters: { ...EMPTY_CHARACTER_FILTERS, statuses: ["alive"] },
    };
    localStorage.setItem(LEGACY_SAVED_FILTERS_KEY, JSON.stringify([legacy]));
    const input = {
      name: "Alive people",
      filter: {
        name: null,
        statuses: ["alive"],
        species: null,
        gender: null,
        dimension: null,
        minEpisodes: null,
        sort: { field: "NAME", direction: "ASC" },
      },
    };
    const { result } = renderHook(() => useSavedCharacterFilters(), {
      wrapper: wrapper([
        {
          request: { query: GetSavedCharacterFiltersQuery },
          result: { data: { savedCharacterFilters: [] } },
        },
        {
          request: {
            query: ImportSavedCharacterFiltersMutation,
            variables: { inputs: [input] },
          },
          result: { data: { importSavedCharacterFilters: [savedFilter] } },
        },
        {
          request: { query: GetSavedCharacterFiltersQuery },
          result: { data: { savedCharacterFilters: [savedFilter] } },
        },
      ]),
    });

    await waitFor(() => expect(result.current.legacyFilterCount).toBe(1));
    await act(async () => result.current.importLegacyFilters());

    await waitFor(() => {
      expect(localStorage.getItem(LEGACY_SAVED_FILTERS_KEY)).toBeNull();
    });
    expect(result.current.legacyFilterCount).toBe(0);
  });
});
