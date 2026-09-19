import { graphql } from "@/lib/graphql/generated";

export const GetLocationsQuery = graphql(`
  query GetLocations {
    locations {
      results {
        id
        name
        type
        dimension
        residents {
          id
          name
        }
      }
    }
  }
`);
