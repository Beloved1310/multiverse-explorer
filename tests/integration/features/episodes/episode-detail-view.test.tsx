import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, expect, it, vi } from "vitest";
import { EpisodeDetailView } from "@/features/episodes/components/episode-detail-view";
import { GetEpisodeQuery } from "@/features/episodes/api/get-episode";
import { buildCharacterFixture } from "../../test-utils/build-characters-response";

// EpisodeDetailView renders a BackLink, which calls useRouter() directly --
// see the character-detail-view suite for why this has to be mocked even
// though nothing here touches the URL.
vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

function buildEpisodeDetailResponse({
  characterCount = 1,
}: { characterCount?: number } = {}) {
  return {
    episode: {
      __typename: "Episode" as const,
      id: "1",
      name: "Pilot",
      episode: "S01E01",
      air_date: "December 2, 2013",
      characters: Array.from({ length: characterCount }, (_, index) =>
        buildCharacterFixture({
          id: String(index + 1),
          name: `Character ${index + 1}`,
        }),
      ),
    },
  };
}

describe("EpisodeDetailView (integration: episode header + cast)", () => {
  it("renders the episode header and its cast", async () => {
    const mocks = [
      {
        request: { query: GetEpisodeQuery, variables: { id: "1" } },
        result: { data: buildEpisodeDetailResponse({ characterCount: 3 }) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeDetailView id="1" />
      </MockedProvider>,
    );

    expect(
      await screen.findByRole("heading", { level: 2, name: "Pilot" }),
    ).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("December 2, 2013")).toBeInTheDocument();
    expect(screen.getByText("Character 1")).toBeInTheDocument();
    expect(screen.getByText("Character 3")).toBeInTheDocument();
  });

  it("shows an empty-cast message when the episode genuinely has no characters", async () => {
    const mocks = [
      {
        request: { query: GetEpisodeQuery, variables: { id: "1" } },
        result: { data: buildEpisodeDetailResponse({ characterCount: 0 }) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeDetailView id="1" />
      </MockedProvider>,
    );

    await screen.findByRole("heading", { level: 2, name: "Pilot" });
    expect(
      screen.getByText("No character appearances on record."),
    ).toBeInTheDocument();
  });

  it("shows a not-found state for a well-formed id that doesn't exist", async () => {
    const mocks = [
      {
        request: { query: GetEpisodeQuery, variables: { id: "999" } },
        result: { data: { episode: null } },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeDetailView id="999" />
      </MockedProvider>,
    );

    expect(await screen.findByText("Episode not found.")).toBeInTheDocument();
  });

  it("shows an error state and recovers via Retry", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: { query: GetEpisodeQuery, variables: { id: "1" } },
        error: new Error("network down"),
      },
      {
        request: { query: GetEpisodeQuery, variables: { id: "1" } },
        result: { data: buildEpisodeDetailResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeDetailView id="1" />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Could not load this episode."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", { level: 2, name: "Pilot" }),
    ).toBeInTheDocument();
  });
});
