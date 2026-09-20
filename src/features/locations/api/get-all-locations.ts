import { graphql } from "@/lib/graphql/generated";

/** Complete catalogue for a future geographic data source, not the removed synthetic map. */
export const GetAllLocationsQuery = graphql(`
  query GetAllLocations {
    allLocations {
      id
      name
      type
      dimension
      residentCount
    }
  }
`);
