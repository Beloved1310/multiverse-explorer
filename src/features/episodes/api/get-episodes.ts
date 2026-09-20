import { graphql } from "@/lib/graphql/generated";

export const GetEpisodesQuery = graphql(`
  query GetEpisodes($filter: EpisodeFilter, $page: Int) {
    episodes(filter: $filter, page: $page) {
      info {
        next
        count
      }
      results {
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
