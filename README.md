# Multiverse Explorer

Browse, filter, and compare every character, location, and episode from Rick and Morty. Built with Next.js, TypeScript, Apollo GraphQL, and Tailwind.

## What it does

- Search and filter characters by status, species, gender, dimension, and episode count.
- Browse locations and episodes with the same kind of filters.
- Compare two characters and see what they share: episodes and locations.
- See curated collections on the home page: most seen characters, characters with unknown origins, most populated locations.
- Create an account and save filter combinations across devices.
- Get a verified next suggestion instead of a dead end when a character search comes back empty.

## Tech stack

- Next.js (App Router) and React for the UI.
- TypeScript everywhere, including the server.
- Apollo Client on the browser and Apollo Server on the backend.
- GraphQL Codegen for typed queries.
- Tailwind CSS for styling.
- Vitest for unit and integration tests, Playwright for end to end tests.
- Docker Compose for a local application and PostgreSQL stack.
- Better Auth, Drizzle, and PostgreSQL for account-backed saved filters.

## Getting started

Requires Node 20 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

`.env.local` needs one value: the upstream GraphQL endpoint the server loads data from. The default in `.env.example` points at the public Rick and Morty API. The browser never talks to that endpoint directly, it only talks to this app's own API at `/api/graphql`. See [docs/api.md](docs/api.md) for why.

For a containerised local stack, run `docker compose up --build`. It starts the
application and a persistent PostgreSQL service. PostgreSQL is provisioned for
the planned authenticated saved-filter feature; the catalogue still uses the
cached BFF. See [docs/deployment.md](docs/deployment.md) for local commands and
production deployment guidance.

## Scripts

| Command                    | What it does                                                |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev`              | Start the app in development mode.                          |
| `npm run build`            | Build for production.                                       |
| `npm run start`            | Run a production build.                                     |
| `npm run lint`             | Check code style with ESLint.                               |
| `npm run typecheck`        | Check types with TypeScript, no build output.               |
| `npm run codegen`          | Regenerate typed GraphQL client code after a schema change. |
| `npm run db:generate`      | Generate a Drizzle migration after a schema change.         |
| `npm run db:migrate`       | Apply checked-in Drizzle migrations.                        |
| `npm run test`             | Run unit and integration tests once.                        |
| `npm run test:unit`        | Run only unit tests.                                        |
| `npm run test:integration` | Run only integration tests.                                 |
| `npm run test:e2e`         | Run end to end tests with Playwright against a real build.  |
| `npm run snapshot`         | Refresh the checked in data snapshot used as a fallback.    |

## How the app is put together

The browser never calls the public Rick and Morty API directly. It calls a GraphQL endpoint that this app owns at `/api/graphql`. That endpoint loads the full catalogue from the upstream API, connects it in memory, and caches it for a day. This is a backend for frontend, and the reasoning behind it is written up in [docs/decisions/008](docs/decisions/008-backend-for-frontend-with-cached-dataset.md): the public API can only filter a few fields and returns one page at a time, so doing the real filtering and sorting on our own server gives the UI far more than the upstream API offers on its own.

Loading that full catalogue fast is its own problem. The upstream API returns 20 items per page, and there are over 800 characters, so paging through one page at a time would mean dozens of slow requests in a row. [docs/decisions/009](docs/decisions/009-batch-fetch-full-catalogue-by-id.md) explains the fix: fetch the total count first, then pull every record in parallel batches of 100 using the API's bulk id queries.

Because the schema's types point back at each other (a character has a location, a location has residents, a resident has episodes, and so on), nothing stops a client from writing a query that walks that chain forever. [docs/decisions/010](docs/decisions/010-graphql-query-depth-limit.md) covers the fix: every incoming query is checked for how deeply it nests before it reaches a resolver, and anything past 8 levels is rejected outright.

Saved filters are private, account-backed preferences. [docs/decisions/011](docs/decisions/011-saved-filters-stay-in-the-browser.md) explains why browser storage was right for the anonymous first release. [docs/decisions/014](docs/decisions/014-server-backed-saved-character-filters.md) explains the implemented Better Auth email/password, Drizzle, and PostgreSQL solution. A one-time import preserves an existing browser-only filter before that old data is removed.

A combined search across characters, locations, and episodes is proposed in [docs/decisions/012](docs/decisions/012-combined-search-without-llm-ranking.md), including why it is planned as a plain, deterministic query instead of one routed through an AI model.

When a character search comes back empty, the app doesn't just show a dead end. [docs/decisions/013](docs/decisions/013-deterministic-socratic-search-recovery.md) explains how the server works out which single remembered detail to relax, checks the matches that produces, and only ever offers back verified, non-empty alternatives with their result counts. Name suggestions use deterministic edit distance, not a language model.

The full decision history, including the reasoning behind each choice, lives in [docs/decisions](docs/decisions).

The GraphQL API itself, its conventions, and example queries are documented in [docs/api.md](docs/api.md).

## Project structure

```
src/
  app/            Next.js routes and pages
  features/       One folder per domain area (characters, episodes, locations)
    api/          Queries and data fetching
    components/   UI for that feature
    domain/       Business logic that isn't UI or fetching
    filters/      Filter state and logic
    mapping/      Turning API responses into the shapes components use
  server/
    graphql/      Schema, resolvers, and the query depth limit
    data/         The loader that builds and caches the in memory dataset
  lib/            Shared setup: Apollo client, generated GraphQL types
docs/
  api.md          GraphQL API reference
  decisions/      Why things were built this way, one decision per file
tests/
  unit/           Fast tests with no network or DOM dependencies
  integration/    Component tests against a mocked GraphQL layer
  e2e/            Playwright tests against a real build and the real API
```

## Testing

Tests are split into three layers on purpose, each catching a different kind of mistake:

- **Unit tests** check pure logic (filters, mapping, domain code) in isolation, so failures point straight at the broken function.
- **Integration tests** render real components against a mocked GraphQL layer, checking that the UI behaves correctly without depending on network conditions.
- **End to end tests** run Playwright against a real production build talking to the real upstream API. This is the one layer that would catch a break in the actual data fetching path, which the other two layers mock away.

Run all three with `npm run test` and `npm run test:e2e`.
