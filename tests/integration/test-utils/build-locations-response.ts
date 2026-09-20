interface LocationFixtureOverrides {
  id?: string;
  name?: string;
  type?: string;
  dimension?: string;
  residentCount?: number;
}

function buildLocationFixture(overrides: LocationFixtureOverrides = {}) {
  const residentCount = overrides.residentCount ?? 1;
  return {
    __typename: "Location" as const,
    id: overrides.id ?? "1",
    name: overrides.name ?? "Earth (C-137)",
    type: overrides.type ?? "Planet",
    dimension: overrides.dimension ?? "Dimension C-137",
    residents: Array.from({ length: residentCount }, (_, index) => ({
      __typename: "Character" as const,
      id: String(index + 1),
    })),
  };
}

interface LocationsResponseOptions {
  next?: number | null;
  count?: number;
}

/** Shapes a `GetLocationsQuery` response the same way the real API does. */
export function buildLocationsResponse(
  locations: LocationFixtureOverrides[] = [{}],
  { next = null, count }: LocationsResponseOptions = {},
) {
  return {
    locations: {
      __typename: "Locations" as const,
      info: {
        __typename: "Info" as const,
        next,
        count: count ?? locations.length,
      },
      results: locations.map(buildLocationFixture),
    },
  };
}
