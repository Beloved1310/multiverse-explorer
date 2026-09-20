import { graphql } from "@/lib/graphql/generated";

export const GetCharacterComparisonQuery = graphql(`
  query GetCharacterComparison($firstId: ID!, $secondId: ID!) {
    compareCharacters(firstId: $firstId, secondId: $secondId) {
      first {
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
      second {
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
      sharedEpisodes {
        id
        name
        episode
        air_date
        characters {
          id
        }
      }
      sharedLocations {
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
