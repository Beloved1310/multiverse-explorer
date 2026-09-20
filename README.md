# Multiverse Explorer

Browse, filter, and compare every character, location, and episode from Rick and Morty. Built with Next.js, TypeScript, Apollo GraphQL, and Tailwind.

**Live demo:** [multiverse-explorer-black.vercel.app](https://multiverse-explorer-black.vercel.app/)

## What it does

- Search and filter characters by status, species, gender, dimension, and episode count.
- Browse locations and episodes with the same kind of filters.
- Compare two characters and see what they share: episodes and locations.
- See curated collections on the home page: most seen characters, characters with unknown origins, most populated locations.
- Save a filter combination in the browser and use it again later.

## Tech stack

- Next.js (App Router) and React for the UI.
- TypeScript everywhere, including the server.
- Apollo Client on the browser and Apollo Server on the backend.
- GraphQL Codegen for typed queries.
- Tailwind CSS for styling.
- Vitest for unit and integration tests, Playwright for end to end tests.

## Getting started

Requires Node 20 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

`.env.local` needs one value: the upstream GraphQL endpoint the server loads data from. The default in `.env.example` points at the public Rick and Morty API. The browser never talks to that endpoint directly, it only talks to this app's own API at `/api/graphql`. See [docs/api.md](docs/api.md) for why.

## Scripts

| Command                    | What it does                                                |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev`              | Start the app in development mode.                          |
| `npm run build`            | Build for production.                                       |
| `npm run start`            | Run a production build.                                     |
| `npm run lint`             | Check code style with ESLint.                               |
| `npm run typecheck`        | Check types with TypeScript, no build output.               |
| `npm run codegen`          | Regenerate typed GraphQL client code after a schema change. |
| `npm run test`             | Run unit and integration tests once.                        |
| `npm run test:unit`        | Run only unit tests.                                        |
| `npm run test:integration` | Run only integration tests.                                 |
| `npm run test:e2e`         | Run end to end tests with Playwright against a real build.  |
| `npm run snapshot`         | Refresh the checked in data snapshot used as a fallback.    |

## How the app is put together

The browser never calls the public Rick and Morty API directly. It calls a GraphQL endpoint that this app owns at `/api/graphql`. That endpoint loads the full catalogue from the upstream API, connects it in memory, and caches it for a day. This is a backend for frontend, and the reasoning behind it is written up in [docs/decisions/1](docs/decisions/1-backend-for-frontend-with-cached-dataset.md): the public API can only filter a few fields and returns one page at a time, so doing the real filtering and sorting on our own server gives the UI far more than the upstream API offers on its own.

Loading that full catalogue fast is its own problem. The upstream API returns 20 items per page, and there are over 800 characters, so paging through one page at a time would mean dozens of slow requests in a row. [docs/decisions/2](docs/decisions/2-batch-fetch-full-catalogue-by-id.md) explains the fix: fetch the total count first, then pull every record in parallel batches of 100 using the API's bulk id queries.

Because the schema's types point back at each other (a character has a location, a location has residents, a resident has episodes, and so on), nothing stops a client from writing a query that walks that chain forever. [docs/decisions/3](docs/decisions/3-graphql-query-depth-limit.md) covers the fix: every incoming query is checked for how deeply it nests before it reaches a resolver, and anything past 8 levels is rejected outright.

Saved filters live entirely in the browser's local storage instead of on a server. [docs/decisions/4](docs/decisions/4-saved-filters-stay-in-the-browser.md) explains why: a server side version would need user accounts and a database, and this app deliberately has neither yet.

A combined search across characters, locations, and episodes is proposed in [docs/decisions/5](docs/decisions/5-combined-search-without-llm-ranking.md), including why it is planned as a plain, deterministic query instead of one routed through an AI model.

When a character search comes back empty, the app doesn't just show a dead end: [docs/decisions/6](docs/decisions/6-deterministic-socratic-search-recovery.md) covers a recovery flow that asks a targeted follow-up question, built from the same deterministic filter data, and only ever offers an option once it already knows that option has real matches.

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

Developers are never fully happy with their own code, and that is part of the fun. See [docs/next-steps.md](docs/next-steps.md) for what's next, and [docs/ai-workflow-notes.md](docs/ai-workflow-notes.md) for how AI was used while building this. 🙂
