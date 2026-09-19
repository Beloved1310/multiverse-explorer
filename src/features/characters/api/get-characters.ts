import { graphql } from "@/lib/graphql/generated";

export const GetCharactersQuery = graphql(`
  query GetCharacters($filter: FilterCharacter, $page: Int) {
    characters(filter: $filter, page: $page) {
      info {
        next
      }
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
