# Docker and deployment

The application is containerised as a standalone Next.js server. Docker Compose
starts that server alongside a persistent PostgreSQL 16 database for local
development and full-stack verification.

PostgreSQL is intentionally not used for the public catalogue. The catalogue
continues to be loaded, connected, and cached by the BFF as described in
[ADR 008](decisions/008-backend-for-frontend-with-cached-dataset.md). The
database is the future home for authenticated saved filters in
[ADR 014](decisions/014-server-backed-saved-character-filters.md), which uses
Better Auth email/password accounts with Drizzle.

## Local stack

Docker Desktop must be running. From the repository root:

```bash
docker compose up --build
```

Open `http://localhost:3000`. PostgreSQL is also available to local tools at
`localhost:5432` using the development values in `.env.example`.

The `app` service waits until PostgreSQL passes `pg_isready`, and the named
`postgres-data` volume keeps database data when containers are recreated. A
one-off `migrate` service applies checked-in Drizzle migrations before the app
starts.

Useful commands:

```bash
docker compose logs -f app
docker compose exec db psql -U multiverse -d multiverse_explorer
docker compose down
```

`docker compose down -v` also removes the local database volume. Use it only
when it is safe to discard local data.

## Production deployment

Build the application image with:

```bash
docker build -t multiverse-explorer:latest .
```

Run the container with its production environment supplied by the deployment
platform:

```bash
docker run --rm -p 3000:3000 \
  -e RICK_AND_MORTY_GRAPHQL_ENDPOINT=https://rickandmortyapi.com/graphql \
  -e DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require' \
  -e BETTER_AUTH_SECRET='A-UNIQUE-32-PLUS-CHARACTER-SECRET' \
  -e BETTER_AUTH_URL='https://YOUR-DOMAIN.example' \
  multiverse-explorer:latest
```

Use a managed PostgreSQL service in production. Do not expose the Compose
database publicly, reuse the development password, or put `DATABASE_URL` in
source control. Apply the checked-in Drizzle migration as a release step before
deploying the saved-filter version. Set a unique, high-entropy `BETTER_AUTH_SECRET` and the public
`BETTER_AUTH_URL` for each environment.

The image runs as a non-root user and contains only the Next.js standalone
output and production runtime dependencies. Docker Compose is suitable for
local development and a single-host demonstration, not as the production
database strategy for a multi-instance service.
