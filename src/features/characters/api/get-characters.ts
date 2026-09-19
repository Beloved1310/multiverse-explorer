import { graphql } from "@/lib/graphql/generated";

export const GetCharactersQuery = graphql(`
  query GetCharacters {
    characters {
      results {
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
    }
  }
`);
