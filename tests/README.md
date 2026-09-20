# Tests

Tests are grouped by what they verify, not by feature, so it's obvious what
guarantee each layer is giving and what runner to reach for:

- **`unit/`** — pure functions and hooks in isolation (mappers, filter
  parsing, `classifyResultState`, `useDebouncedValue`, retry logic). Mirrors
  `src/`'s folder structure 1:1. No network, no rendering. Run with
  `npm run test:unit`.
- **`integration/`** — components wired to the real data layer, with only
  the network boundary mocked (`@apollo/client/testing`'s `MockedProvider`
  for GraphQL, a small fake router in `test-utils/mock-next-navigation.ts`
  for `next/navigation`). Proves the URL-driven filter state, the debounced
  search box, and the results grid actually work together. Run with
  `npm run test:integration`.
- **`e2e/`** — Playwright, against a real production build talking to the
  live rickandmortyapi.com API. The only layer that exercises real
  data-fetching end to end. Run with `npm run test:e2e`.

`npm run test` runs `unit/` + `integration/` (both are Vitest); `e2e/` is
excluded from that (see `vitest.config.mts`'s `test.include`) since it needs
Playwright's own runner and a built app, not Vitest.
