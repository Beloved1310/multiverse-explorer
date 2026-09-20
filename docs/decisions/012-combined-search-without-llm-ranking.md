# 012. Combined search suggestions across entities, without server-side LLM ranking

## Status

Proposed

## Context

Today `characters`, `episodes`, and `locations` are three independent, paged queries (see [docs/api.md](../api.md)), each filtered case-insensitively by substring. There's no single entry point that answers "what matches 'Rick' across everything," and no suggestion/autocomplete behavior as someone types — every search means picking an entity type first, then submitting a full page query.

The catalogue this runs against is small and static: it's loaded once, connected, and cached in memory for 24 hours ([008](008-backend-for-frontend-with-cached-dataset.md)), so search executes over a few hundred in-process records, not a datastore that needs external retrieval.

One way to build combined search and suggestions is to send the query (and candidate records) to an AI model server-side, and have it interpret intent, rank matches, and merge them across types. That handles typos and natural-language queries well, but it's worth checking against this app's actual shape before adopting it.

## Decision

Combined search is a plain, deterministic GraphQL query implemented in-process, not a call to an AI model.

Add a `search(query: String!, limit: Int = 5): SearchResults!` query that runs the query string against the same in-memory dataset the existing `characters`/`episodes`/`locations` resolvers use, scores each candidate's name (exact match > starts-with > substring), and returns the top matches per type, capped at `limit` each. This one query backs both a combined-results view and as-you-type suggestions — the client doesn't need a separate suggestions endpoint.

No request leaves the process to answer a search: no model API call, no embeddings index or vector store, no per-query latency or cost beyond what every other query already pays.

## Consequences

This keeps search as fast and cheap as everything else in this BFF ([008](008-backend-for-frontend-with-cached-dataset.md)) — sub-millisecond, in-memory, free per request — and keeps it deterministic and unit-testable the same way `character-filters.ts` and its siblings already are. There's no new failure mode to design around: no rate limits, no model timeouts, no nondeterministic ranking to explain when a result looks wrong.

The trade-off is that this search only understands substrings and prefix ranking. It won't resolve typos ("Rikc"), synonyms, or natural-language questions, and scoring relevance across three different entity types with one function is a coarser signal than a model could produce.

An LLM-backed layer becomes the right call if the catalogue stops being small, static, and fully loaded in memory — the same trigger [008](008-backend-for-frontend-with-cached-dataset.md) names for moving to a real database — or if the actual need is answering natural-language questions ("which locations have residents from more than three dimensions") rather than typo-tolerant lookup by name. At that point the model should sit behind this same `search` query as an alternate resolver, not replace the deterministic path that suggestions still need to stay instant.
