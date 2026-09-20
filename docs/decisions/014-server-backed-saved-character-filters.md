# 014. Saved character filters become owner-scoped PostgreSQL records

## Status

Accepted

## Context

[011](011-saved-filters-stay-in-the-browser.md) intentionally stores saved
character filters in `localStorage`. That was the right first version because
the application had no accounts and a saved filter was a browser convenience.

The limitation is now product-facing: a person cannot use their saved filters
on another device, loses them when browser data is cleared, and cannot receive
support for them. A server cannot fix this without knowing which person owns a
filter. Putting every visitor's filters in a shared database table would be a
privacy and security defect, not an improvement.

This decision concerns user preferences only. It does not replace the cached
catalogue strategy in [008](008-backend-for-frontend-with-cached-dataset.md):
the Rick and Morty catalogue remains a small, read-only, cached dataset.

## Decision

Saved character filters move to PostgreSQL through Drizzle. Better Auth
will provide the email-and-password sign-up, sign-in, sign-out, password
hashing, and session handling. The GraphQL server will be the only code that
reads or writes filters. The browser will continue to use URLs as the portable
way to share an active search.

Better Auth is chosen instead of a social-login-only solution or custom
credential code. People need only a name, email address, and password to use
this feature. Better Auth has built-in email/password support and an official
Drizzle adapter for PostgreSQL, so the application retains its data while not
becoming responsible for implementing password hashing and session security.

The first release remains deliberately small:

- Signed-in people can list, create, apply, and delete their own character
  filters.
- A filter has a short name and the existing, validated character-filter
  shape. The shape is stored as versioned `JSONB` so a later filter can add a
  field without a disruptive table migration.
- Filters are private. There are no teams, public saved filters, editing by
  others, offline synchronisation, or usage analytics in this release.

Better Auth owns its generated authentication schema. It includes `user`,
`account`, `session`, and `verification` tables. Its `account` record stores
the password hash, never the raw password. The application owns only this
additional table:

```text
saved_character_filters
  id                 UUID primary key
  user_id            text references user(id)
  name               varchar(80)
  filter             JSONB
  filter_version     smallint
  created_at         timestamp
  updated_at         timestamp

index (user_id, updated_at desc)
unique (user_id, name)
```

The database does not decide whether a filter is valid. A shared server-side
validator will validate the input before persistence and validate the JSONB
record when it is read. Better Auth will resolve the signed-in user from its
secure session. GraphQL resolver context will receive that user, and every
query or mutation will scope by the user's id. An id supplied by the client is
never enough to grant access to a saved filter.

The GraphQL contract will add only the operations required by the first
release:

```graphql
savedCharacterFilters: [SavedCharacterFilter!]!
createSavedCharacterFilter(input: SaveCharacterFilterInput!): SavedCharacterFilter!
deleteSavedCharacterFilter(id: ID!): Boolean!
```

`createSavedCharacterFilter` rejects blank names, names longer than 80
characters, invalid filter fields, duplicate names for the same person, and a
reasonable per-person limit. `deleteSavedCharacterFilter` returns success only
for a record owned by the current person. The existing read-only BFF becomes
read-mostly for this narrow, authenticated preference feature.

## Implementation plan

1. Add Better Auth, Drizzle, PostgreSQL driver dependencies, and Better Auth's
   Next.js route handler at `/api/auth/[...all]`. Enable only email/password
   authentication and expose a small `currentUser` boundary to application
   code. Do not build password storage or session handling from scratch.
2. Configure Better Auth with its Drizzle PostgreSQL adapter. Generate the
   Better Auth schema, add `saved_character_filters`, and check in the Drizzle
   migration. Keep `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`
   in environment variables.
3. Add a server-side `SavedCharacterFilter` service. It owns validation,
   ownership checks, the per-person limit, and Drizzle queries. GraphQL
   resolvers call this service rather than Drizzle directly.
4. Pass the Better Auth session into GraphQL context. Add the three GraphQL
   operations and generated client types. Replace
   `useSavedCharacterFilters` with a query and mutations that use this API.
   Existing filter-bar components continue to receive the same domain model.
5. Add simple sign-up, sign-in, and sign-out screens using the Better Auth
   client. Offer a one-time, explicit migration after sign-in when the old local key
   exists: "Import N saved filters". On success, remove the local key. On a
   network or validation failure, leave it untouched so nothing is lost.
6. Remove the local-storage hook and its persistence tests. Keep only the
   isolated legacy reader during the migration window. It clears the browser
   key after a successful import and never dual-writes to browser storage and
   PostgreSQL, so the source of truth remains clear.
7. Add unit tests for validation and ownership, integration tests against a
   test database for create/list/delete and duplicate names, and end-to-end
   tests for sign-in, one-time import, cross-session persistence, and an
   unauthorised request.

## Consequences

Saved filters become durable account settings that follow a person between
devices and can be diagnosed safely by support tooling. PostgreSQL and Drizzle
are justified by user-owned, mutable data with ownership and migration needs,
not by the public catalogue itself.

The cost is authentication, database operations, migrations, secrets,
backups, and responsibility for personal data. The feature will no longer work
for an anonymous visitor, so the interface must clearly offer sign-in instead
of silently pretending that a save succeeded. The first release deliberately
excludes password reset and email verification, but those are required before
a public production launch.

If this grows into shared operational views, the same ownership model can
expand to organisations and memberships. That is intentionally not part of
the first release.
