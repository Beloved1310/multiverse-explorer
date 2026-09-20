import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, expect, it, vi } from "vitest";
import { SearchRecovery } from "@/features/characters/components/search-recovery";
import { GetSearchRecoveryQuery } from "@/features/characters/api/get-search-recovery";
import type { CharacterFilters } from "@/features/characters/filters/character-filters";

const filters: CharacterFilters = {
  name: "rick",
  statuses: ["dead"],
  species: "",
  gender: "",
  dimension: "",
  minEpisodes: "",
  sort: "name-asc",
};

describe("SearchRecovery (integration: server decision to URL-shaped filter)", () => {
  it("renders only server-backed options and replaces the full conflicting filter", async () => {
    const onFiltersChange = vi.fn();
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetSearchRecoveryQuery,
          variables: { input: { name: "rick", statuses: ["dead"] } },
        },
        result: {
          data: {
            searchRecovery: {
              __typename: "SearchRecovery",
              step: "STATUS",
              question: "Do you remember their status?",
              options: [
                {
                  __typename: "SearchRecoveryOption",
                  label: "Alive",
                  value: "Alive",
                  count: 1,
                  filter: {
                    __typename: "RecoveryCharacterFilter",
                    name: "rick",
                    statuses: ["Alive"],
                    species: null,
                    gender: null,
                    dimension: null,
                    minEpisodes: null,
                  },
                },
              ],
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <SearchRecovery filters={filters} onFiltersChange={onFiltersChange} />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Do you remember their status?"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Alive, 1 match/ }));

    expect(onFiltersChange).toHaveBeenCalledWith({
      name: "rick",
      statuses: ["Alive"],
      species: "",
      gender: "",
      dimension: "",
      minEpisodes: "",
    });
  });

  it("stays out of the way when the BFF finds no useful next question", async () => {
    const mocks = [
      {
        request: {
          query: GetSearchRecoveryQuery,
          variables: { input: { name: "rick", statuses: ["dead"] } },
        },
        result: { data: { searchRecovery: null } },
      },
    ];

    const { container } = render(
      <MockedProvider mocks={mocks}>
        <SearchRecovery filters={filters} onFiltersChange={vi.fn()} />
      </MockedProvider>,
    );

    // A null BFF recovery is intentionally silent; the ordinary empty state
    // remains responsible for the clear-filters action.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
