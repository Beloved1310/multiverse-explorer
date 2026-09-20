# API

The app is served by a single read-only GraphQL endpoint at `/api/graphql`. It's a backend-for-frontend (BFF): the browser only ever talks to this endpoint, which in turn owns the connection to the upstream Rick and Morty API and all filtering/sorting/relationship logic. See [docs/decisions/1-backend-for-frontend-with-cached-dataset.md](decisions/1-backend-for-frontend-with-cached-dataset.md) for why.

The schema itself is documented inline (see [src/server/graphql/type-defs.ts](../src/server/graphql/type-defs.ts)) and browsable via introspection — run `npm run dev` and open `http://localhost:3000/api/graphql` in a browser to get Apollo Sandbox, which reads those descriptions and lets you run queries interactively. This document is a narrative companion to that, not a replacement for it.

## Conventions

- **Transport**: POST or GET to `/api/graphql` — see [Making a request](#making-a-request) below, GET has one extra requirement.
- **Pagination**: paged fields return `{ info: PageInfo, results: [...] }`. Page size is fixed at 20. `info.next` / `info.prev` are `null` at the ends of the range; an out-of-range `page` clamps to the nearest valid page instead of erroring.
- **Text filters**: every string filter (`name`, `species`, `gender`, `type`, `dimension`, episode `episode` code, ...) matches case-insensitively as a substring, not an exact match.
- **Query depth**: queries nested more than 8 levels deep are rejected before they reach any resolver (`src/server/graphql/depth-limit.ts`).
- **Freshness**: all data comes from an in-memory dataset cached for 24 hours (`src/server/data/loader.ts`), with a checked-in snapshot (`src/server/data/snapshot.json`) used if the upstream API is unreachable. There's no way to force a refresh from the API itself.

## Making a request

The examples below are real, working requests against this endpoint — copy-paste them as-is.

### POST (the one to use by default)

Send a JSON body with a `query` string and, if the query has variables, a `variables` object. The `Content-Type: application/json` header is required.

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetCharacter($id: ID!) { character(id: $id) { name species } }",
    "variables": { "id": "2" }
  }'
```

```json
{ "data": { "character": { "name": "Morty Smith", "species": "Human" } } }
```

### GET

Also supported, with `query` and (optionally) `variables` as URL-encoded query-string parameters — useful for a request you want to be shareable as a plain link, or cacheable by something in front of the endpoint.

```bash
curl -G http://localhost:3000/api/graphql \
  --data-urlencode 'query={ character(id: "1") { name } }' \
  -H "apollo-require-preflight: true"
```

That `apollo-require-preflight: true` header is not optional. Apollo Server's built-in CSRF protection rejects any GET (or `text/plain`/form-encoded POST) request that doesn't carry either a non-simple `Content-Type` or one of the headers `apollo-require-preflight` / `x-apollo-operation-name` — a plain GET has neither by default, so leaving it off fails every time with a 400 and a "Cross-Site Request Forgery" error, not a GraphQL error. Apollo Client and Apollo Sandbox both add the header automatically, which is why this only bites you when calling the API directly with something like `curl` or `fetch`.

### Errors

The HTTP status code tells you which of three situations you're in:

| Status                               | Meaning                                                                                                                                                                                                                                                                 | Example                                                                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`, with `data`                   | The query ran. A `null` field (e.g. `character(id: "999999")` for an id that doesn't exist) is a normal, successful result, not an error — check for `null`, don't expect an error to be thrown.                                                                        | `{ "data": { "character": null } }`                                                                                                                   |
| `400`, with `errors`                 | The request itself was invalid: a malformed query, a query nested more than 8 levels deep, an unrecognized field, or a missing CSRF header on GET. `errors[0].extensions.code` is the stable machine-readable reason (e.g. `GRAPHQL_VALIDATION_FAILED`, `BAD_REQUEST`). | `{ "errors": [{ "message": "Cannot query field \"nonsenseField\" on type \"Character\".", "extensions": { "code": "GRAPHQL_VALIDATION_FAILED" } }] }` |
| `200`, with both `data` and `errors` | Part of the query succeeded and part failed (possible once a query asks for more than one top-level field). Read `data` for whatever did resolve and `errors` for what didn't.                                                                                          | —                                                                                                                                                     |

In development, error objects also include a `stacktrace` array; that's stripped in production.

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
