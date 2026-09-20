import { graphql } from "@/lib/graphql/generated";

export const GetCharacterQuery = graphql(`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      image
      status
      species
      gender
      origin {
        id
        name
      }
      location {
        id
        name
      }
      episodeCount
      episodeSeasons {
        season
        count
      }
    }
  }
`);
