# 2. Load the full catalogue with batched id queries instead of paging

## Status

Accepted

## Context

[1](1-backend-for-frontend-with-cached-dataset.md) commits us to loading the entire catalogue once and caching it. The public API's normal query returns 20 items per page. Characters alone are 800+, so paging through it page by page means dozens of slow, sequential requests, and we'd still need a second pass to resolve the relationship ids (origin, location, episodes) that each page leaves out.

## Decision

The loader first asks the public API for the total count of each entity type, builds the full list of ids from that count, splits the list into batches of 100, and fetches every batch in parallel using the API's `charactersByIds` / `locationsByIds` / `episodesByIds` bulk queries. Each request retries with backoff on failure. If the load fails outright, we fall back to the checked-in snapshot instead of showing an error.

## Consequences

Loading is a handful of parallel requests instead of dozens of sequential ones, and every character/location/episode already carries the relationship ids we need. This makes us dependent on the upstream API's `byIds` queries specifically: if that shape changes, the loader breaks even though the paged queries would still work fine. Because the whole load happens before anything is cached, a partial failure (e.g. episodes fail but characters succeed) can't leave us with a half-built dataset — we fall back to the full snapshot instead, which is unrelated to the load's outcome.

## Why the batch size is a judgment call, not a fixed rule

100 ids per request is a starting guess, not a measured limit. It's small enough to avoid an oversized request body and large enough to keep the request count low. If the upstream API turns out to reject or throttle batches that size, this is the one constant to change — it isn't wired into anything else.
