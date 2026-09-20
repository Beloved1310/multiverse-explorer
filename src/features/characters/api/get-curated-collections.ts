import { graphql } from "@/lib/graphql/generated";

export const GetCuratedCollectionsQuery = graphql(`
  query GetCuratedCollections($limit: Int) {
    curatedCollections(limit: $limit) {
      mostSeenCharacters {
        id
        name
        image
        status
        species
        gender
        origin {
          name
        }
        location {
          name
        }
        episode {
          name
        }
      }
      charactersWithUnknownOrigins {
        id
        name
        image
        status
        species
        gender
        origin {
          name
        }
        location {
          name
        }
        episode {
          name
        }
      }
      mostPopulatedLocations {
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
