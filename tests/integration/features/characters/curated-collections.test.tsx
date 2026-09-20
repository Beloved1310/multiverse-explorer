import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, expect, it } from "vitest";
import { CuratedCollections } from "@/features/characters/components/curated-collections";
import { GetCuratedCollectionsQuery } from "@/features/characters/api/get-curated-collections";
import { buildCharacterFixture } from "../../test-utils/build-characters-response";

describe("CuratedCollections (integration: home page discovery rows)", () => {
  it("renders each of the three collections with links to their full listing", async () => {
    const mocks = [
      {
        request: { query: GetCuratedCollectionsQuery, variables: { limit: 3 } },
        result: {
          data: {
            curatedCollections: {
              __typename: "CuratedCollections" as const,
              mostSeenCharacters: [
                buildCharacterFixture({ id: "1", name: "Rick Sanchez" }),
              ],
              charactersWithUnknownOrigins: [
                buildCharacterFixture({ id: "7", name: "Mr. Poopybutthole" }),
              ],
              mostPopulatedLocations: [
                // Deliberately not "Citadel of Ricks" -- that's also
                // buildCharacterFixture's default `location`, which would
                // make the name ambiguous on the page.
                {
                  __typename: "Location" as const,
                  id: "3",
                  name: "Anatomy Park",
                  type: "Microverse",
                  dimension: "unknown",
                  residents: [{ __typename: "Character" as const, id: "1" }],
                },
              ],
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CuratedCollections />
      </MockedProvider>,
    );

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText("Mr. Poopybutthole")).toBeInTheDocument();
    expect(screen.getByText("Anatomy Park")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "See all characters" }),
    ).toHaveAttribute("href", "/characters?sort=episodes-desc");
    expect(
      screen.getByRole("link", { name: "Explore characters" }),
    ).toHaveAttribute("href", "/characters");
    expect(
      screen.getByRole("link", { name: "Explore locations" }),
    ).toHaveAttribute("href", "/locations");
  });

  it("degrades to rendering nothing on a GraphQL error, rather than crashing the home page", async () => {
    const mocks = [
      {
        request: { query: GetCuratedCollectionsQuery, variables: { limit: 3 } },
        error: new Error("network down"),
      },
    ];

    const { container } = render(
      <MockedProvider mocks={mocks}>
        <CuratedCollections />
      </MockedProvider>,
    );

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
