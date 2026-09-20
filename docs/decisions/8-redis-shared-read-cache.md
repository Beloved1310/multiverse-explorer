# 8. Redis as an optional shared read cache

## Status

Accepted

## Context

The backend-for-frontend reads a complete, small catalogue and already caches it for 24 hours with Next.js. That is sufficient on one application instance. In a horizontally scaled deployment, however, individual instances can have cold caches and refresh the same upstream dataset independently.

## Decision

Add Redis as an optional cache-aside layer for the connected dataset. When `REDIS_URL` is configured, an instance reads `multiverse-explorer:dataset:v1` before loading upstream data. A cache miss loads and connects the catalogue, then writes it to Redis with the same 24-hour TTL. Redis failures never fail a user request: the BFF continues through its existing Next.js cache and snapshot fallback.

## Consequences

Instances share one read cache, reducing duplicate upstream loads and making read latency more consistent. Redis is deliberately limited to shared, read-mostly catalogue data. It is not used for source-of-truth data, user sessions, or mutations, so it can be unavailable without data loss or an outage.

This is appropriate for distributed reads. If search becomes larger, frequently updated, or transactional, PostgreSQL with indexes becomes the system of record and Redis remains a cache in front of it.
