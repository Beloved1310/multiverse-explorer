import { graphql } from "@/lib/graphql/generated";

export const GetLocationQuery = graphql(`
  query GetLocation($id: ID!) {
    location(id: $id) {
      id
      name
      type
      dimension
      residents {
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
      episodesFeaturingResidents {
        id
        name
        episode
        air_date
        characters {
          id
        }
      }
    }
  }
`);
