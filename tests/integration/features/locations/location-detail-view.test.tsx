import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, expect, it, vi } from "vitest";
import { LocationDetailView } from "@/features/locations/components/location-detail-view";
import { GetLocationQuery } from "@/features/locations/api/get-location";
import { buildCharacterFixture } from "../../test-utils/build-characters-response";

// LocationDetailView renders a BackLink, which calls useRouter() directly --
// see the character-detail-view suite for why this has to be mocked even
// though nothing here touches the URL.
vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

/** Matches text split across the "Showing X of Y" caption's child spans. */
function textOf(target: string) {
  return (_: string, element: Element | null) =>
    element?.textContent?.replace(/\s+/g, " ").trim() === target;
}

function buildLocationDetailResponse({
  residentCount = 1,
  dimension = "Dimension C-137",
}: { residentCount?: number; dimension?: string } = {}) {
  return {
    location: {
      __typename: "Location" as const,
      id: "3",
      name: "Citadel of Ricks",
      type: "Space station",
      dimension,
      residents: Array.from({ length: residentCount }, (_, index) =>
        buildCharacterFixture({
          id: String(index + 1),
          name: `Rick ${index + 1}`,
        }),
      ),
      episodesFeaturingResidents: [
        {
          __typename: "Episode" as const,
          id: "28",
          name: "The Ricklantis Mixup",
          episode: "S03E07",
          air_date: "September 10, 2017",
          characters: [{ __typename: "Character" as const, id: "1" }],
        },
      ],
    },
  };
}

describe("LocationDetailView (integration: residents + related episodes)", () => {
  it("renders location attributes, residents, related episodes, and the cross-feature dimension link", async () => {
    const mocks = [
      {
        request: { query: GetLocationQuery, variables: { id: "3" } },
        result: { data: buildLocationDetailResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationDetailView id="3" />
      </MockedProvider>,
    );

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Citadel of Ricks",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Space station")).toBeInTheDocument();
    expect(screen.getByText("Dimension C-137")).toBeInTheDocument();

    expect(screen.getByText("Rick 1")).toBeInTheDocument();
    expect(screen.getByText("The Ricklantis Mixup")).toBeInTheDocument();

    // The one place a location's own data feeds back into the character
    // filter set (see location-detail-view.tsx) -- worth pinning the exact
    // URL shape, not just that a link exists.
    expect(
      screen.getByRole("link", { name: "Browse characters in this dimension" }),
    ).toHaveAttribute("href", "/characters?dimension=Dimension%20C-137");
  });

  it("omits the dimension link when the dimension is unknown", async () => {
    const mocks = [
      {
        request: { query: GetLocationQuery, variables: { id: "3" } },
        result: { data: buildLocationDetailResponse({ dimension: "Unknown" }) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationDetailView id="3" />
      </MockedProvider>,
    );

    await screen.findByRole("heading", { level: 2, name: "Citadel of Ricks" });
    expect(
      screen.queryByRole("link", { name: /Browse characters/ }),
    ).not.toBeInTheDocument();
  });

  it("reveals more residents locally, with no further network request", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetLocationQuery, variables: { id: "3" } },
        result: { data: buildLocationDetailResponse({ residentCount: 15 }) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationDetailView id="3" />
      </MockedProvider>,
    );

    await screen.findByText("Rick 1");
    expect(
      screen.getByText(textOf("Showing 12 of 15 residents")),
    ).toBeInTheDocument();
    expect(screen.queryByText("Rick 13")).not.toBeInTheDocument();

    // A second mock would be required if this issued a network request --
    // there is only one above, so this proves the reveal is purely local
    // `visibleCount` state (see CharacterCollectionSection).
    await user.click(screen.getByRole("button", { name: "Show more" }));

    expect(screen.getByText("Rick 13")).toBeInTheDocument();
    expect(
      screen.getByText(textOf("Showing 15 of 15 residents")),
    ).toBeInTheDocument();
  });

  it("shows a not-found state for a well-formed id that doesn't exist", async () => {
    const mocks = [
      {
        request: { query: GetLocationQuery, variables: { id: "999" } },
        result: { data: { location: null } },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationDetailView id="999" />
      </MockedProvider>,
    );

    expect(await screen.findByText("Location not found.")).toBeInTheDocument();
  });

  it("shows an error state and recovers via Retry", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetLocationQuery, variables: { id: "3" } },
        error: new Error("network down"),
      },
      {
        request: { query: GetLocationQuery, variables: { id: "3" } },
        result: { data: buildLocationDetailResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationDetailView id="3" />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Could not load this location."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Citadel of Ricks",
      }),
    ).toBeInTheDocument();
  });
});
