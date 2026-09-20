import { graphql } from "@/lib/graphql/generated";

export const GetSavedCharacterFiltersQuery = graphql(`
  query GetSavedCharacterFilters {
    savedCharacterFilters {
      id
      name
      filter {
        name
        statuses
        species
        gender
        dimension
        minEpisodes
        sort {
          field
          direction
        }
      }
    }
  }
`);

export const CreateSavedCharacterFilterMutation = graphql(`
  mutation CreateSavedCharacterFilter($input: SaveCharacterFilterInput!) {
    createSavedCharacterFilter(input: $input) {
      id
      name
      filter {
        name
        statuses
        species
        gender
        dimension
        minEpisodes
        sort {
          field
          direction
        }
      }
    }
  }
`);

export const DeleteSavedCharacterFilterMutation = graphql(`
  mutation DeleteSavedCharacterFilter($id: ID!) {
    deleteSavedCharacterFilter(id: $id)
  }
`);

export const ImportSavedCharacterFiltersMutation = graphql(`
  mutation ImportSavedCharacterFilters($inputs: [SaveCharacterFilterInput!]!) {
    importSavedCharacterFilters(inputs: $inputs) {
      id
      name
      filter {
        name
        statuses
        species
        gender
        dimension
        minEpisodes
        sort {
          field
          direction
        }
      }
    }
  }
`);
