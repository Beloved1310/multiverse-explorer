import { graphql } from "@/lib/graphql/generated";

export const GetCharactersQuery = graphql(`
  query GetCharacters(
    $filter: CharacterFilter
    $page: Int
    $sort: CharacterSort
  ) {
    characters(filter: $filter, page: $page, sort: $sort) {
      info {
        next
        count
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
