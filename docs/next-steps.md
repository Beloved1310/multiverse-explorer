# Next steps

If more time were available, the next improvements would focus on reliability, discovery, and proving quality in production.

## Product

- Add a small onboarding prompt that explains search, saved filters, and character comparison on first visit.
- Extend comparison with clearer relationship insights, such as shared origin, current location, and episode overlap by season.
- Add curated, shareable collections with editorial descriptions and stable URLs.
- Let signed-in users manage saved searches from an account page, including rename and duplicate actions.

## Quality and accessibility

- Add visual regression tests at 375px, 768px, and 1280px for the explorers, detail pages, and comparison flow.
- Run an automated accessibility audit in CI and manually test key journeys with a screen reader.
- Add end-to-end coverage for sign-up, sign-in, saved-search migration, and authenticated saved-filter management against a real test database.
- Measure Core Web Vitals in production and tune image sizes, loading priority, and route-level loading states from real data.

## Platform and operations

- Deploy the application, PostgreSQL database, migrations, and environment configuration to a managed production platform.
- Add error monitoring, structured server logs, and a health endpoint for the GraphQL service and data snapshot fallback.
- Add scheduled snapshot refreshes and alerting when the public Rick and Morty API cannot be reached.
- Redis is now an optional shared cache for the connected catalogue. Configure `REDIS_URL` when the app runs across multiple server instances; reads use cache-aside behaviour and safely fall back to Next.js cache and the snapshot if Redis is unavailable.
- Introduce database-backed analytics only after defining clear product questions and a privacy-aware retention policy.

## Scale

- Move from the cached in-memory catalogue to PostgreSQL-backed search when data size, refresh frequency, or concurrent traffic makes full-catalogue loading inefficient.
- Add database indexes and cursor pagination before large result sets become a performance problem.
- Keep the mapping layer as the boundary between external data, the backend API, and the UI so upstream schema changes remain contained.
