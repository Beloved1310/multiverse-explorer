# API

The app is served by a single read-only GraphQL endpoint at `/api/graphql`. It's a backend-for-frontend (BFF): the browser only ever talks to this endpoint, which in turn owns the connection to the upstream Rick and Morty API and all filtering/sorting/relationship logic. See [docs/decisions/008-backend-for-frontend-with-cached-dataset.md](decisions/008-backend-for-frontend-with-cached-dataset.md) for why.

The schema itself is documented inline (see [src/server/graphql/type-defs.ts](../src/server/graphql/type-defs.ts)) and browsable via introspection — run `npm run dev` and open `http://localhost:3000/api/graphql` in a browser to get Apollo Sandbox, which reads those descriptions and lets you run queries interactively. This document is a narrative companion to that, not a replacement for it.

## Conventions

- **Transport**: POST (or GET) to `/api/graphql` with a standard GraphQL request body (`query`, `variables`).
- **Pagination**: paged fields return `{ info: PageInfo, results: [...] }`. Page size is fixed at 20. `info.next` / `info.prev` are `null` at the ends of the range; an out-of-range `page` clamps to the nearest valid page instead of erroring.
- **Text filters**: every string filter (`name`, `species`, `gender`, `type`, `dimension`, episode `episode` code, ...) matches case-insensitively as a substring, not an exact match.
- **Query depth**: queries nested more than 8 levels deep are rejected before they reach any resolver (`src/server/graphql/depth-limit.ts`).
- **Freshness**: all data comes from an in-memory dataset cached for 24 hours (`src/server/data/loader.ts`), with a checked-in snapshot (`src/server/data/snapshot.json`) used if the upstream API is unreachable. There's no way to force a refresh from the API itself.

## Queries

### `characters(filter, page, sort)`

Search characters. All arguments are optional.

```graphql
query {
  characters(
    filter: { statuses: ["Alive"], species: "Human", minEpisodes: 5 }
    sort: { field: EPISODE_COUNT, direction: DESC }
    page: 1
  ) {
    info {
      count
      pages
      next
      prev
    }
    results {
      id
      name
      status
      species
      episodeCount
      origin {
        name
      }
      location {
        name
      }
    }
  }
}
```

`filter.dimension` matches against the character's current location's dimension, falling back to their origin's dimension if they have no current location.

### `character(id)`

A single character, or `null` if the id doesn't exist.

### `episodes(filter, page)` / `episode(id)`

Same shape as characters. `filter.episode` matches against the production code (e.g. `"S01E01"`), not the episode's name.

### `locations(filter, page)` / `location(id)` / `allLocations`

`locations` is paged and filterable; `allLocations` returns the entire catalogue unpaged, for cases like building a full picker or map (see `GetAllLocationsQuery`).

### `curatedCollections(limit: Int = 6)`

Editorial groupings used on discovery surfaces (e.g. the home page):

```graphql
query {
  curatedCollections(limit: 6) {
    mostSeenCharacters {
      id
      name
      episodeCount
    }
    charactersWithUnknownOrigins {
      id
      name
    }
    mostPopulatedLocations {
      id
      name
      residentCount
    }
  }
}
```

`limit` is clamped server-side to the range 1–12.

### `compareCharacters(firstId, secondId)`

Returns the two characters plus their shared episodes and shared origin/current locations. Returns `null` if either id doesn't exist or the two ids are the same (compare that client-side first if you want a nicer error message than a null result).

```graphql
query {
  compareCharacters(firstId: "1", secondId: "2") {
    first {
      name
    }
    second {
      name
    }
    sharedEpisodes {
      id
      name
    }
    sharedLocations {
      id
      name
    }
  }
}
```

## Adding a field or query

1. Add it to the SDL in `src/server/graphql/type-defs.ts`, with a `"description"` string on anything not self-explanatory from its name.
2. Implement the resolver in `src/server/graphql/schema.ts`, reading from `getConnectedDataset()`.
3. Run `npm run codegen` to regenerate the typed client documents in `src/lib/graphql/generated/`.
4. Consume it from a feature's `api/` folder the same way existing queries are — see `src/features/characters/api/get-characters.ts` for the pattern.
