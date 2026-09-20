# 010. Reject deeply nested queries before they run

## Status

Accepted

## Context

Our GraphQL schema is public and browsable (Apollo Sandbox at `/api/graphql`, see [docs/api.md](../api.md)). Its types point back at each other: a character has a location, a location has residents (characters), a character has episodes, an episode has characters, and so on. Nothing stops a client from writing a query that follows that chain many times over — character → location → residents → episode → characters → location → ... — forcing the server to walk the same relationships over and over for one request.

## Decision

A custom validation rule (`createDepthLimitRule` in `src/server/graphql/depth-limit.ts`) walks the shape of every incoming query before it reaches a resolver and rejects any query nested more than 8 levels deep, with a plain error message.

## Consequences

The check costs nothing to run and doesn't depend on the size of the dataset — it only looks at the shape of the query text. Every real query the UI sends (an entity plus one or two levels of relationships) sits well under 8 levels, so this is invisible to normal use. Any future screen that genuinely needs deeper nesting will fail this check and require either a flatter query or a deliberate change to the limit — it will not fail silently or slowly.

This only limits how deep a query nests, not how wide it is (e.g. requesting the same field 500 times with different aliases). It closes the specific recursive path this schema's relationships create, not every possible abuse of a GraphQL endpoint.
