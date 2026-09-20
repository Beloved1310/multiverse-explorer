import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, expect, it, vi } from "vitest";
import { CharacterDetailView } from "@/features/characters/components/character-detail-view";
import { GetCharacterQuery } from "@/features/characters/api/get-character";

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
      episode: [
        {
          __typename: "Episode" as const,
          id: "1",
          name: "Pilot",
          episode: "S01E01",
          air_date: "December 2, 2013",
        },
        {
          __typename: "Episode" as const,
          id: "2",
          name: "Lawnmower Dog",
          episode: "S01E02",
          air_date: "December 9, 2013",
        },
        {
          __typename: "Episode" as const,
          id: "11",
          name: "A Rickle in Time",
          episode: "S02E01",
          air_date: "July 26, 2015",
        },
        {
          __typename: "Episode" as const,
          id: "99",
          name: "Anime Special",
          episode: "TBA",
          air_date: "Unknown",
        },
      ],
    },
  };
}

describe("CharacterDetailView (integration: profile + season-grouped episodes)", () => {
  it("renders the profile and groups episodes into expandable seasons, the first expanded by default", async () => {
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        result: { data: buildCharacterDetailResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="1" />
      </MockedProvider>,
    );

    expect(
      await screen.findByRole("heading", { level: 2, name: "Rick Sanchez" }),
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

    expect(screen.getByText("Pilot")).toBeVisible();
    expect(screen.getByText("A Rickle in Time")).not.toBeVisible();
    expect(screen.getByText("Anime Special")).not.toBeVisible();
  });

  it("expands and collapses seasons individually and all at once", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetCharacterQuery, variables: { id: "1" } },
        result: { data: buildCharacterDetailResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterDetailView id="1" />
      </MockedProvider>,
    );

    await screen.findByText("Pilot");

    await user.click(screen.getByRole("button", { name: /Season 2/ }));
    expect(screen.getByText("A Rickle in Time")).toBeVisible();
    // Season 1 is untouched by toggling season 2.
    expect(screen.getByText("Pilot")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Expand all" }));
    expect(screen.getByText("Anime Special")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.getByText("Pilot")).not.toBeVisible();
    expect(screen.getByText("A Rickle in Time")).not.toBeVisible();
    expect(screen.getByText("Anime Special")).not.toBeVisible();
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
      await screen.findByRole("heading", { level: 2, name: "Rick Sanchez" }),
    ).toBeInTheDocument();
  });
});
