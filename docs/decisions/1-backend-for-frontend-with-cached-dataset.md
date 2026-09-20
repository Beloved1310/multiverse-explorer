# 1. Backend-for-frontend with a cached dataset instead of a database

## Status

Accepted

## Context

The public Rick and Morty API can filter only a few exact fields and returns one page at a time. The catalogue is small, changes infrequently, and has useful relationships between characters, locations, and episodes.

## Decision

The application loads the complete catalogue on the server, connects it in memory, and caches that connected dataset for 24 hours. Our read-only GraphQL endpoint exposes the search, filtering, sorting, paging, and relationship queries required by the interface. A checked-in snapshot keeps the application usable when the upstream API is unavailable.

There is no database in this phase.

## Consequences

This gives the UI richer filters and stable query shapes without browser-to-upstream requests. It also avoids schema migrations, database operations, and duplicated data while the catalogue is small.

The trade-off is that cache refreshes load the whole catalogue, results are at most a day old, and the data cannot be edited or shared between deployments beyond the cache and snapshot. It is not a suitable pattern for large, frequently changing, user-owned, or transactional data.

PostgreSQL becomes the right choice when the catalogue grows enough that full refreshes are slow or costly, when updates need durable history or admin workflows, when several application instances need a shared source of truth, or when query volume and reporting need database indexes and joins.

## Why the mapping layer matters

The UI still receives its familiar character, episode, and location domain models even though the source moved from a public API to a BFF. Only the transport-specific mapping boundary needed to account for the BFF's guaranteed relationship data. That separation keeps components insulated from API shape changes and makes a later PostgreSQL-backed implementation a server concern rather than a screen-by-screen rewrite.
