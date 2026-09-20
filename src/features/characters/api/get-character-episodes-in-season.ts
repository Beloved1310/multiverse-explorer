import { graphql } from "@/lib/graphql/generated";

export const GetCharacterEpisodesInSeasonQuery = graphql(`
  query GetCharacterEpisodesInSeason($id: ID!, $season: Int, $page: Int) {
    character(id: $id) {
      id
      episodesInSeason(season: $season, page: $page) {
        info {
          count
          pages
          next
          prev
        }
        results {
          id
          name
          episode
          air_date
        }
      }
    }
  }
`);
