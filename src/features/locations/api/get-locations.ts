import { graphql } from "@/lib/graphql/generated";

export const GetLocationsQuery = graphql(`
  query GetLocations($filter: FilterLocation, $page: Int) {
    locations(filter: $filter, page: $page) {
      info {
        next
        count
      }
      results {
        id
        name
        type
        dimension
        residents {
          id
        }
      }
    }
  }
`);
