import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, expect, it, vi } from "vitest";
import { CharacterDetailView } from "@/features/characters/components/character-detail-view";
import { GetCharacterQuery } from "@/features/characters/api/get-character";
import { GetCharacterEpisodesInSeasonQuery } from "@/features/characters/api/get-character-episodes-in-season";

// CharacterDetailView renders a BackLink, which calls useRouter() directly
// (see components/back-link.tsx) -- outside a real Next.js app router,
// that throws "invariant expected app router to be mounted" unless
// next/navigation is mocked, even though this suite doesn't touch the URL.
vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

function buildCharacterDetailResponse() {
  return {
    character: {
      __typename: "Character" as const,
      id: "1",
      name: "Rick Sanchez",
      image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      status: "Alive",
      species: "Human",
      gender: "Male",
      origin: {
        __typename: "Location" as const,
        id: "1",
        name: "Earth (C-137)",
      },
      location: {
        __typename: "Location" as const,
        id: "3",
        name: "Citadel of Ricks",
      },
      // 2 episodes in season 1, 1 in season 2, 1 with an unparsed code --
      // the individual episodes themselves are fetched separately, per
      // season, only once that season's panel is expanded.
      episodeCount: 4,
      episodeSeasons: [
        { __typename: "CharacterEpisodeSeason" as const, season: 1, count: 2 },
        { __typename: "CharacterEpisodeSeason" as const, season: 2, count: 1 },
        {
          __typename: "CharacterEpisodeSeason" as const,
          season: null,
          count: 1,
        },
      ],
    },
  };
}

function buildSeasonEpisodesResponse(
  episodes: Array<{
    id: string;
    name: string;
    episode: string;
    air_date: string;
  }>,
  info: {
    next?: number | null;
    prev?: number | null;
    pages?: number;
    count?: number;
  } = {},
) {
  return {
    character: {
      __typename: "Character" as const,
      id: "1",
      episodesInSeason: {
        __typename: "CharacterEpisodesPage" as const,
        info: {
          __typename: "PageInfo" as const,
          count: info.count ?? episodes.length,
          pages: info.pages ?? 1,
          next: info.next ?? null,
          prev: info.prev ?? null,
        },
        results: episodes.map((episode) => ({
          __typename: "Episode" as const,
          ...episode,
        })),
      },
    },
  };
}

const season1Mock = {
  request: {
    query: GetCharacterEpisodesInSeasonQuery,
    variables: { id: "1", season: 1, page: 1 },
  },
  result: {
    data: buildSeasonEpisodesResponse([
      {
        id: "1",
        name: "Pilot",
        episode: "S01E01",
        air_date: "December 2, 2013",
      },
      {
        id: "2",
        name: "Lawnmower Dog",
        episode: "S01E02",
        air_date: "December 9, 2013",
      },
    ]),
  },
};

const season2Mock = {
  request: {
    query: GetCharacterEpisodesInSeasonQuery,
    variables: { id: "1", season: 2, page: 1 },
  },
  result: {
    data: buildSeasonEpisodesResponse([
      {
        id: "11",
        name: "A Rickle in Time",
        episode: "S02E01",
        air_date: "July 26, 2015",
      },
    ]),
  },
};

const otherSeasonMock = {
  request: {
    query: GetCharacterEpisodesInSeasonQuery,
    variables: { id: "1", season: null, page: 1 },
  },
  result: {
    data: buildSeasonEpisodesResponse([
      {
        id: "99",
        name: "Anime Special",
        episode: "TBA",
        air_date: "Unknown",
      },
    ]),
  },
};

describe("CharacterDetailView (integration: profile + season-grouped, paginated episodes)", () => {
  it("renders the profile and season summary, fetching only the first (auto-expanded) season", async () => {
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        result: { data: buildCharacterDetailResponse() },
      },
      season1Mock,
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="1" />
      </MockedProvider>,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Rick Sanchez" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Earth (C-137)" })).toHaveAttribute(
      "href",
      "/locations/1",
    );
    expect(
      screen.getByRole("link", { name: "Citadel of Ricks" }),
    ).toHaveAttribute("href", "/locations/3");

    expect(
      screen.getByText("Appears in 4 episodes across 3 seasons"),
    ).toBeInTheDocument();

    const season1 = screen.getByRole("button", { name: /Season 1/ });
    const season2 = screen.getByRole("button", { name: /Season 2/ });
    const other = screen.getByRole("button", { name: /Other/ });

    expect(season1).toHaveAttribute("aria-expanded", "true");
    expect(season2).toHaveAttribute("aria-expanded", "false");
    expect(other).toHaveAttribute("aria-expanded", "false");

    expect(await screen.findByText("Pilot")).toBeVisible();

    // Seasons 2 and "Other" were never expanded, so their episodes were
    // never fetched -- not just hidden, genuinely absent from the DOM.
    expect(screen.queryByText("A Rickle in Time")).not.toBeInTheDocument();
    expect(screen.queryByText("Anime Special")).not.toBeInTheDocument();
  });

  it("fetches a season's episodes on first expand, then toggles visibility without refetching", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        result: { data: buildCharacterDetailResponse() },
      },
      season1Mock,
      season2Mock,
      otherSeasonMock,
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="1" />
      </MockedProvider>,
    );

    await screen.findByText("Pilot");

    await user.click(screen.getByRole("button", { name: /Season 2/ }));
    expect(await screen.findByText("A Rickle in Time")).toBeVisible();
    // Season 1 is untouched by toggling season 2.
    expect(screen.getByText("Pilot")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Expand all" }));
    expect(await screen.findByText("Anime Special")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Collapse all" }));
    // Already-fetched seasons stay mounted (so re-expanding is instant,
    // with no refetch) -- collapsing hides them, it doesn't unmount them.
    expect(screen.getByText("Pilot")).not.toBeVisible();
    expect(screen.getByText("A Rickle in Time")).not.toBeVisible();
    expect(screen.getByText("Anime Special")).not.toBeVisible();

    await user.click(screen.getByRole("button", { name: /Season 1/ }));
    expect(screen.getByText("Pilot")).toBeVisible();
  });

  it("navigates a season's episodes one page at a time with next/previous controls", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        result: { data: buildCharacterDetailResponse() },
      },
      {
        request: {
          query: GetCharacterEpisodesInSeasonQuery,
          variables: { id: "1", season: 1, page: 1 },
        },
        result: {
          data: buildSeasonEpisodesResponse(
            [
              {
                id: "1",
                name: "Pilot",
                episode: "S01E01",
                air_date: "December 2, 2013",
              },
            ],
            { next: 2, prev: null, pages: 2, count: 2 },
          ),
        },
      },
      {
        request: {
          query: GetCharacterEpisodesInSeasonQuery,
          variables: { id: "1", season: 1, page: 2 },
        },
        result: {
          data: buildSeasonEpisodesResponse(
            [
              {
                id: "2",
                name: "Lawnmower Dog",
                episode: "S01E02",
                air_date: "December 9, 2013",
              },
            ],
            { next: null, prev: 1, pages: 2, count: 2 },
          ),
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="1" />
      </MockedProvider>,
    );

    await screen.findByText("Pilot");
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    // On the first page, there's nothing to go back to.
    expect(
      screen.queryByRole("button", { name: "Previous page" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    // A page replaces the previous one -- it doesn't accumulate like the
    // app's other "Load more" lists.
    expect(await screen.findByText("Lawnmower Dog")).toBeInTheDocument();
    expect(screen.queryByText("Pilot")).not.toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    // On the last page, there's nothing further to go to.
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous page" }));

    // Reading page 1 back out of the cache, not a second network request
    // for it (only one mock exists per page above).
    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    expect(screen.queryByText("Lawnmower Dog")).not.toBeInTheDocument();
  });

  it("shows a not-found state for a well-formed id that doesn't exist", async () => {
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "999" } },
        result: { data: { character: null } },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="999" />
      </MockedProvider>,
    );

    expect(await screen.findByText("Character not found.")).toBeInTheDocument();
  });

  it("shows an error state and recovers via Retry", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        error: new Error("network down"),
      },
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        result: { data: buildCharacterDetailResponse() },
      },
      season1Mock,
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="1" />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Could not load this character."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Rick Sanchez" }),
    ).toBeInTheDocument();
  });
});
