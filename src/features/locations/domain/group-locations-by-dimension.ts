import type { Location } from "./location";

export interface LocationDimensionGroup {
  key: string;
  dimension: string;
  locations: Location[];
}

const UNKNOWN_DIMENSION = "Unknown";

/**
 * Groups locations by dimension, alphabetically, with "Unknown" pushed to
 * the end so the atlas reads real places first. Locations keep their
 * incoming order within a group, so grouping stays stable as more pages
 * load in.
 */
export function groupLocationsByDimension(
  locations: Location[],
): LocationDimensionGroup[] {
  const groups = new Map<string, Location[]>();

  locations.forEach((location) => {
    const group = groups.get(location.dimension) ?? [];
    group.push(location);
    groups.set(location.dimension, group);
  });

  return [...groups.entries()]
    .sort(([firstDimension], [secondDimension]) => {
      if (firstDimension === secondDimension) return 0;
      if (firstDimension === UNKNOWN_DIMENSION) return 1;
      if (secondDimension === UNKNOWN_DIMENSION) return -1;
      return firstDimension.localeCompare(secondDimension);
    })
    .map(([dimension, dimensionLocations]) => ({
      key: dimension,
      dimension,
      locations: dimensionLocations,
    }));
}
