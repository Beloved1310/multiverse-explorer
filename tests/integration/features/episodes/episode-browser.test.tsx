import { InMemoryCache } from "@apollo/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodeBrowser } from "@/features/episodes/components/episode-browser";
import { GetEpisodesQuery } from "@/features/episodes/api/get-episodes";
import { episodeCacheTypePolicies } from "@/features/episodes/api/cache-policies";
import {
  __resetNavigationMock,
  routerReplace,
} from "../../test-utils/mock-next-navigation";
import { buildEpisodesResponse } from "../../test-utils/build-episodes-response";

vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

describe("EpisodeBrowser (integration: filter bar + results + GraphQL layer)", () => {
  beforeEach(() => {
    __resetNavigationMock();
  });

  it("renders episodes returned by the GraphQL layer", async () => {
    const mocks = [
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: {
          data: buildEpisodesResponse([
            { name: "Pilot", episode: "S01E01", characterCount: 4 },
          ]),
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeBrowser />
      </MockedProvider>,
    );

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
    expect(screen.getByText("S01E01")).toBeInTheDocument();
    expect(screen.getByText("4 characters")).toBeInTheDocument();
  });

  it("commits name and code together, mapping the URL's `code` to the GraphQL `episode` field", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: { data: buildEpisodesResponse([{ name: "Pilot" }]) },
      },
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: { episode: "S01E01" }, page: 1 },
        },
        result: {
          data: buildEpisodesResponse([{ name: "Pilot", episode: "S01E01" }]),
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Pilot");

    await user.type(screen.getByLabelText("Episode code"), "S01E01");

    // The filter bar's field is `code`; the URL param stays `code`.
    await waitFor(() => {
      expect(routerReplace).toHaveBeenLastCalledWith("/?code=S01E01", {
        scroll: false,
      });
    });

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
  });

  it("shows an empty state with a working clear-filters action", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: { name: "nonexistent" }, page: 1 },
        },
        result: { data: buildEpisodesResponse([]) },
      },
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: { data: buildEpisodesResponse([{ name: "Pilot" }]) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeBrowser />
      </MockedProvider>,
    );

    await user.type(
      screen.getByPlaceholderText("Search episodes…"),
      "nonexistent",
    );

    expect(
      await screen.findByText("No episodes match that search."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
  });

  it("shows an error state and recovers via Retry", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 1 },
        },
        error: new Error("network down"),
      },
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: { data: buildEpisodesResponse([{ name: "Pilot" }]) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EpisodeBrowser />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Could not load episodes."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Pilot")).toBeInTheDocument();
  });

  it("merges a second page onto the first via the real cache policy", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: {
          data: buildEpisodesResponse([{ id: "1", name: "Pilot" }], {
            next: 2,
            count: 2,
          }),
        },
      },
      {
        request: {
          query: GetEpisodesQuery,
          variables: { filter: undefined, page: 2 },
        },
        result: {
          data: buildEpisodesResponse([{ id: "2", name: "Lawnmower Dog" }], {
            next: null,
            count: 2,
          }),
        },
      },
    ];

    render(
      <MockedProvider
        mocks={mocks}
        cache={new InMemoryCache({ typePolicies: episodeCacheTypePolicies })}
      >
        <EpisodeBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Pilot");
    await user.click(screen.getByRole("button", { name: "Load more" }));

    expect(await screen.findByText("Lawnmower Dog")).toBeInTheDocument();
    expect(screen.getByText("Pilot")).toBeInTheDocument();
  });
});
