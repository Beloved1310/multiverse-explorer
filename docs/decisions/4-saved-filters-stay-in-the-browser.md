# 4. Saved character filters live in the browser, not on a server

## Status

Accepted

## Context

We want people to save a named combination of filters (e.g. "Alive humans, 5+ episodes") and reuse it later. Doing that on a server means user accounts, a login flow, and a database — all of which [1](1-backend-for-frontend-with-cached-dataset.md) already ruled out for this phase, since the app has no concept of a signed-in user at all.

## Decision

Saved filters are stored entirely in `localStorage`, under one versioned key, read and written by `useSavedCharacterFilters`. Anything read back out of storage is checked against the expected shape before use; if it doesn't match (corrupted, hand-edited, or from an older version), it's treated as no saved filters rather than crashing the app.

## Consequences

This gives the feature real persistence across visits with no backend to build, secure, or pay to run. The trade-off is that saved filters are tied to one browser: they don't follow the person to another device, and they disappear if site data is cleared. We also have no visibility into them for support or analytics, which is fine for a personal convenience feature but would not be if it needed to feel like an account-level setting.

If saved filters ever need to sync across devices, that's a sign the app needs real accounts and a database — not a reason to route this specific feature through a server on its own.
