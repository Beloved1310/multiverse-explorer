import { graphql } from "@/lib/graphql/generated";

export const GetSearchRecoveryQuery = graphql(`
  query GetSearchRecovery($input: SearchRecoveryInput!) {
    searchRecovery(input: $input) {
      step
      question
      options {
        label
        value
        count
        filter {
          name
          statuses
          species
          gender
          dimension
          minEpisodes
        }
      }
    }
  }
`);
