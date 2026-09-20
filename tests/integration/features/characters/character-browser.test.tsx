import { InMemoryCache } from "@apollo/client";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterBrowser } from "@/features/characters/components/character-browser";
import { GetCharactersQuery } from "@/features/characters/api/get-characters";
import { characterCacheTypePolicies } from "@/features/characters/api/cache-policies";
import {
  __resetNavigationMock,
  routerReplace,
} from "../../test-utils/mock-next-navigation";
import { buildCharactersResponse } from "../../test-utils/build-characters-response";

const NAME_SORT = { field: "NAME" as const, direction: "ASC" as const };

// This is what turns the URL-driven filter hook (useCharacterFilters) into
// something testable at all: without a fake router that actually updates
// on `replace`, this suite could only prove typing calls a function, never
// that the result re-renders with the new filters applied.
vi.mock(
  "next/navigation",
  () => import("../../test-utils/mock-next-navigation"),
);

describe("CharacterBrowser (integration: filter bar + results + GraphQL layer)", () => {
  beforeEach(() => {
    __resetNavigationMock();
  });

  it("renders characters returned by the GraphQL layer, extras included", async () => {
    const mocks = [
      {
        request: {
          query: GetCharactersQuery,
          variables: {
            filter: undefined,
            page: 1,
            sort: { field: "NAME", direction: "ASC" },
          },
        },
        result: { data: buildCharactersResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterBrowser />
      </MockedProvider>,
    );

    expect(await screen.findByText("Rick Sanchez")).toBeInTheDocument();

    // Scoped to the card itself: "Human" and "Alive" also appear as
    // <option> text in the (always-present-in-the-DOM) species/status
    // filter <select>s, so an unscoped query would be ambiguous.
    const card = screen.getByRole("link", {
      name: /View Rick Sanchez, Alive, 1 episode/i,
    });
    expect(within(card).getByText("Human")).toBeInTheDocument();
    expect(within(card).getByText("Citadel of Ricks")).toBeInTheDocument();
    expect(within(card).getByText("Alive")).toBeInTheDocument();
  });

  it("debounces the search box, writes the URL, and re-fetches filtered results", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetCharactersQuery,
          variables: {
            filter: undefined,
            page: 1,
            sort: { field: "NAME", direction: "ASC" },
          },
        },
        result: { data: buildCharactersResponse() },
      },
      {
        request: {
          query: GetCharactersQuery,
          variables: {
            filter: { name: "morty" },
            page: 1,
            sort: { field: "NAME", direction: "ASC" },
          },
        },
        result: {
          data: buildCharactersResponse([
            {
              id: "2",
              name: "Morty Smith",
              location: "Earth (Replacement Dimension)",
            },
          ]),
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Rick Sanchez");

    await user.type(screen.getByPlaceholderText("Search characters…"), "morty");

    await waitFor(() => {
      expect(routerReplace).toHaveBeenLastCalledWith("/?name=morty", {
        scroll: false,
      });
    });

    expect(
      await screen.findByRole("link", { name: /View Morty Smith/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Rick Sanchez")).not.toBeInTheDocument();
  });

  it("applies a status filter immediately, updates the active-filter count, and Clear all resets it", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetCharactersQuery,
          variables: {
            filter: undefined,
            page: 1,
            sort: { field: "NAME", direction: "ASC" },
          },
        },
        result: { data: buildCharactersResponse() },
      },
      {
        request: {
          query: GetCharactersQuery,
          variables: {
            filter: { statuses: ["alive"] },
            page: 1,
            sort: { field: "NAME", direction: "ASC" },
          },
        },
        result: { data: buildCharactersResponse() },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <CharacterBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Rick Sanchez");

    await user.click(screen.getByRole("button", { name: "Filters and sort" }));

    const clearButton = screen.getByRole("button", { name: "Clear all" });
    expect(clearButton).toBeDisabled();

    await user.click(screen.getByLabelText("Alive"));

    expect(routerReplace).toHaveBeenLastCalledWith("/?status=alive", {
      scroll: false,
    });
    expect((await screen.findAllByText("1")).length).toBeGreaterThan(0);
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);

    expect(routerReplace).toHaveBeenLastCalledWith("/", { scroll: false });
    await waitFor(() => expect(clearButton).toBeDisabled());
  });

  it("merges a second page onto the first via the real cache policy, then shows the edge of the list", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetCharactersQuery,
          variables: { filter: undefined, page: 1, sort: NAME_SORT },
        },
        result: {
          data: buildCharactersResponse([{ id: "1", name: "Rick Sanchez" }], {
            next: 2,
            count: 2,
          }),
        },
      },
      {
        request: {
          query: GetCharactersQuery,
          variables: { filter: undefined, page: 2, sort: NAME_SORT },
        },
        result: {
          data: buildCharactersResponse([{ id: "2", name: "Morty Smith" }], {
            next: null,
            count: 2,
          }),
        },
      },
    ];

    render(
      <MockedProvider
        mocks={mocks}
        cache={new InMemoryCache({ typePolicies: characterCacheTypePolicies })}
      >
        <CharacterBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Rick Sanchez");
    await user.click(screen.getByRole("button", { name: "Load more" }));

    // Both pages on screen at once -- a merge, not a replace. If
    // mergeCharacters ever regressed to always returning `incoming`, page
    // one would disappear the moment page two arrived.
    expect(await screen.findByText("Morty Smith")).toBeInTheDocument();
    expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    expect(
      screen.getByText(/You.ve reached the edge of this reality\./),
    ).toBeInTheDocument();
  });

  it("starts a fresh list on a new filter instead of appending onto an already-paginated one", async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: GetCharactersQuery,
          variables: { filter: undefined, page: 1, sort: NAME_SORT },
        },
        result: {
          data: buildCharactersResponse([{ id: "1", name: "Rick Sanchez" }], {
            next: 2,
            count: 2,
          }),
        },
      },
      {
        request: {
          query: GetCharactersQuery,
          variables: { filter: undefined, page: 2, sort: NAME_SORT },
        },
        result: {
          data: buildCharactersResponse([{ id: "2", name: "Morty Smith" }], {
            next: null,
            count: 2,
          }),
        },
      },
      {
        request: {
          query: GetCharactersQuery,
          variables: { filter: { name: "beth" }, page: 1, sort: NAME_SORT },
        },
        result: {
          data: buildCharactersResponse([{ id: "3", name: "Beth Smith" }], {
            next: null,
            count: 1,
          }),
        },
      },
    ];

    render(
      <MockedProvider
        mocks={mocks}
        cache={new InMemoryCache({ typePolicies: characterCacheTypePolicies })}
      >
        <CharacterBrowser />
      </MockedProvider>,
    );

    await screen.findByText("Rick Sanchez");
    await user.click(screen.getByRole("button", { name: "Load more" }));
    await screen.findByText("Morty Smith");

    await user.type(screen.getByPlaceholderText("Search characters…"), "beth");

    // If `keyArgs` ever grew to include `page`, or the merge stopped
    // resetting on page 1, this would show three characters instead of
    // the new filter's own single result.
    expect(
      await screen.findByRole("link", { name: /View Beth Smith/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Rick Sanchez")).not.toBeInTheDocument();
    expect(screen.queryByText("Morty Smith")).not.toBeInTheDocument();
  });
});
