import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterComparison } from "@/features/characters/components/character-comparison";
import { GetCharactersQuery } from "@/features/characters/api/get-characters";
import { GetCharacterComparisonQuery } from "@/features/characters/api/get-character-comparison";
import { buildCharacterFixture } from "../../test-utils/build-characters-response";
import {
  __resetNavigationMock,
  __setSearch,
} from "../../test-utils/mock-next-navigation";

// Renders a BackLink (useRouter()) and reads/writes ?first=&second= via
// useSearchParams()/router.replace(), so the shared navigation mock is
// needed for both reasons, not just the URL round trip.
vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

const NAME_SORT = { field: "NAME" as const, direction: "ASC" as const };

function picksMock(name: string, matches: Array<{ id: string; name: string }>) {
  return {
    request: {
      query: GetCharactersQuery,
      variables: { filter: { name }, page: 1, sort: NAME_SORT },
    },
    result: {
      data: {
        characters: {
          __typename: "Characters" as const,
          info: {
            __typename: "Info" as const,
            next: null,
            count: matches.length,
          },
          results: matches.map(({ id, name: matchName }) =>
            buildCharacterFixture({ id, name: matchName }),
          ),
        },
      },
    },
  };
}

describe("CharacterComparison (integration: two-picker search + shared results)", () => {
  beforeEach(() => {
    __resetNavigationMock();
  });

  it("finds and selects a character per picker, then shows their shared episodes and locations", async () => {
    const user = userEvent.setup();
    // CharacterPicker has no debounce -- it queries on every keystroke past
    // one character (see character-comparison.tsx). fireEvent.change fires
    // a single change with the final value instead of one query per
    // keystroke, so only the query actually asserted on needs a mock.
    const mocks = [
      picksMock("rick", [{ id: "1", name: "Rick Sanchez" }]),
      picksMock("morty", [{ id: "2", name: "Morty Smith" }]),
      {
        request: {
          query: GetCharacterComparisonQuery,
          variables: { firstId: "1", secondId: "2" },
        },
        result: {
          data: {
            compareCharacters: {
              __typename: "CharacterComparison" as const,
              // A different `location` than the shared-location fixture
              // below, on purpose -- both default to "Citadel of Ricks",
              // which would make "Citadel of Ricks" ambiguous on the page.
              first: buildCharacterFixture({
                id: "1",
                name: "Rick Sanchez",
                location: "Earth (Replacement Dimension)",
              }),
              second: buildCharacterFixture({
                id: "2",
                name: "Morty Smith",
                location: "Earth (Replacement Dimension)",
              }),
              sharedEpisodes: [
                {
                  __typename: "Episode" as const,
                  id: "1",
                  name: "Pilot",
                  episode: "S01E01",
                  air_date: "December 2, 2013",
                  characters: [],
                },
              ],
              sharedLocations: [
                {
                  __typename: "Location" as const,
                  id: "3",
                  name: "Citadel of Ricks",
                  type: "Space station",
                  dimension: "unknown",
                  residents: [],
                },
              ],
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterComparison />
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText("First character"), {
      target: { value: "rick" },
    });
    await user.click(
      await screen.findByRole("button", { name: "Rick Sanchez" }),
    );

    fireEvent.change(screen.getByLabelText("Second character"), {
      target: { value: "morty" },
    });
    await user.click(
      await screen.findByRole("button", { name: "Morty Smith" }),
    );

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("Citadel of Ricks")).toBeInTheDocument();
    // Both selected characters' own cards render too, alongside the
    // shared-episode/location cards -- distinct sections of the page.
    expect(
      screen.getByRole("region", { name: "Selected characters" }),
    ).toBeInTheDocument();
  });

  it("shows a self-comparison warning instead of querying when both slots hold the same id", async () => {
    __setSearch("first=1&second=1");

    render(
      <MockedProvider mocks={[]}>
        <CharacterComparison />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Choose two different characters."),
    ).toBeInTheDocument();
    // No compareCharacters mock was provided at all -- if the component
    // queried anyway, MockedProvider would fail the test with "no matching
    // mock found" rather than this panel rendering.
  });

  it("renders explicit empty states when characters share nothing", async () => {
    __setSearch("first=1&second=2");
    const mocks = [
      {
        request: {
          query: GetCharacterComparisonQuery,
          variables: { firstId: "1", secondId: "2" },
        },
        result: {
          data: {
            compareCharacters: {
              __typename: "CharacterComparison" as const,
              first: buildCharacterFixture({ id: "1", name: "Rick Sanchez" }),
              second: buildCharacterFixture({ id: "2", name: "Morty Smith" }),
              sharedEpisodes: [],
              sharedLocations: [],
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterComparison />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("No shared episodes on record."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No shared origin or current location."),
    ).toBeInTheDocument();
  });

  it("does not query the picker until at least two characters have been typed", async () => {
    const user = userEvent.setup();
    // Only a two-letter-or-longer query has a mock at all -- if the
    // component queried on a single letter, MockedProvider would fail
    // with "no matching mock found".
    const mocks = [picksMock("ri", [{ id: "1", name: "Rick Sanchez" }])];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterComparison />
      </MockedProvider>,
    );

    const input = screen.getByLabelText("First character");
    await user.type(input, "r");
    expect(
      screen.queryByRole("button", { name: "Rick Sanchez" }),
    ).not.toBeInTheDocument();

    await user.type(input, "i");
    expect(
      await screen.findByRole("button", { name: "Rick Sanchez" }),
    ).toBeInTheDocument();
  });
});
