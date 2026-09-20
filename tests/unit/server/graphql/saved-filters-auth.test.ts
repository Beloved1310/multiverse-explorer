import { describe, expect, it, vi } from "vitest";

const savedFilterService = vi.hoisted(() => ({
  listSavedFilters: vi.fn(),
  createSavedFilter: vi.fn(),
  deleteSavedFilter: vi.fn(),
}));

vi.mock("@/server/data/loader", () => ({
  getConnectedDataset: vi.fn(),
}));
vi.mock("@/server/saved-filters/service", () => ({
  listSavedFilters: savedFilterService.listSavedFilters,
  createSavedFilter: savedFilterService.createSavedFilter,
  deleteSavedFilter: savedFilterService.deleteSavedFilter,
  importSavedFilters: vi.fn(),
  SavedFilterLimitError: class SavedFilterLimitError extends Error {},
  SavedFilterValidationError: class SavedFilterValidationError extends Error {},
}));

import { resolvers } from "@/server/graphql/schema";

describe("saved-filter GraphQL authorization", () => {
  it("rejects an anonymous saved-filter query", async () => {
    await expect(
      resolvers.Query.savedCharacterFilters({}, {}, { userId: null }),
    ).rejects.toMatchObject({
      message: "Sign in to manage saved searches.",
      extensions: { code: "UNAUTHENTICATED" },
    });
  });

  it("passes only the authenticated user id to the saved-filter service", async () => {
    savedFilterService.listSavedFilters.mockResolvedValueOnce([]);
    await resolvers.Query.savedCharacterFilters({}, {}, { userId: "user-123" });
    expect(savedFilterService.listSavedFilters).toHaveBeenCalledWith(
      "user-123",
    );
  });

  it("does not let a delete mutation choose another filter owner", async () => {
    savedFilterService.deleteSavedFilter.mockResolvedValueOnce(false);
    const result = await resolvers.Mutation.deleteSavedCharacterFilter(
      {},
      { id: "filter-owned-by-someone-else" },
      { userId: "user-123" },
    );
    expect(result).toBe(false);
    expect(savedFilterService.deleteSavedFilter).toHaveBeenCalledWith(
      "user-123",
      "filter-owned-by-someone-else",
    );
  });
});
