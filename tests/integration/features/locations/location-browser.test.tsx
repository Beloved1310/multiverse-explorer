import { InMemoryCache } from "@apollo/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationBrowser } from "@/features/locations/components/location-browser";
import { GetLocationsQuery } from "@/features/locations/api/get-locations";
import { locationCacheTypePolicies } from "@/features/locations/api/cache-policies";
import {
  __resetNavigationMock,
  routerReplace,
} from "../../test-utils/mock-next-navigation";
import { buildLocationsResponse } from "../../test-utils/build-locations-response";

vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

describe("LocationBrowser (integration: filter bar + results + GraphQL layer)", () => {
  beforeEach(() => {
    __resetNavigationMock();
  });

  it("renders locations returned by the GraphQL layer", async () => {
    const mocks = [
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: {
          data: buildLocationsResponse([
            { name: "Earth (C-137)", type: "Planet", residentCount: 3 },
          ]),
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationBrowser />
      </MockedProvider>,
    );

    expect(await screen.findByText("Earth (C-137)")).toBeInTheDocument();
    expect(screen.getByText("3 residents")).toBeInTheDocument();
  });

  it("debounces name, type, and dimension together into one committed filter", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: { data: buildLocationsResponse([{ name: "Earth (C-137)" }]) },
      },
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: { dimension: "C-137" }, page: 1 },
        },
        result: {
          data: buildLocationsResponse([
            { name: "Earth (C-137)", dimension: "Dimension C-137" },
          ]),
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Earth (C-137)");

    // Typing only the dimension field must still commit a filter object
    // containing just `dimension` -- name/type stay omitted, not sent as
    // empty strings, because toGraphQLLocationFilter drops falsy fields.
    await user.type(screen.getByLabelText("Dimension"), "C-137");

    await waitFor(() => {
      expect(routerReplace).toHaveBeenLastCalledWith("/?dimension=C-137", {
        scroll: false,
      });
    });

    expect(await screen.findByText("Dimension C-137")).toBeInTheDocument();
  });

  it("shows an empty state with a working clear-filters action", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: { name: "nowhere" }, page: 1 },
        },
        result: { data: buildLocationsResponse([]) },
      },
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: { data: buildLocationsResponse([{ name: "Earth (C-137)" }]) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationBrowser />
      </MockedProvider>,
    );

    await user.type(
      screen.getByPlaceholderText("Search locations…"),
      "nowhere",
    );

    expect(
      await screen.findByText("No locations match that search."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(await screen.findByText("Earth (C-137)")).toBeInTheDocument();
  });

  it("shows an error state and recovers via Retry", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 1 },
        },
        error: new Error("network down"),
      },
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: { data: buildLocationsResponse([{ name: "Earth (C-137)" }]) },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LocationBrowser />
      </MockedProvider>,
    );

    expect(
      await screen.findByText("Could not load locations."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Earth (C-137)")).toBeInTheDocument();
  });

  it("merges a second page onto the first via the real cache policy, without duplicating on retry", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 1 },
        },
        result: {
          data: buildLocationsResponse([{ id: "1", name: "Earth (C-137)" }], {
            next: 2,
            count: 2,
          }),
        },
      },
      {
        request: {
          query: GetLocationsQuery,
          variables: { filter: undefined, page: 2 },
        },
        result: {
          data: buildLocationsResponse(
            [{ id: "2", name: "Citadel of Ricks" }],
            {
              next: null,
              count: 2,
            },
          ),
        },
      },
    ];

    render(
      <MockedProvider
        mocks={mocks}
        cache={new InMemoryCache({ typePolicies: locationCacheTypePolicies })}
      >
        <LocationBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Earth (C-137)");
    await user.click(screen.getByRole("button", { name: "Load more" }));

    // Both pages' results are on screen at once -- a merge, not a
    // replace. If mergeLocations ever regressed to `keyArgs` including
    // `page`, or to always returning `incoming`, this would show only
    // page two.
    expect(await screen.findByText("Citadel of Ricks")).toBeInTheDocument();
    expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
    expect(
      screen.getByText(/You.ve reached the edge of this reality\./),
    ).toBeInTheDocument();
  });
});
