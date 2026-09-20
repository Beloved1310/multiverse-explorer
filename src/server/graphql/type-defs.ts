import "server-only";

export const typeDefs = `
  """
  Read-only BFF over an in-memory, connected snapshot of the Rick and Morty
  catalogue. See docs/api.md for an overview and example queries. Query
  depth is capped (see depth-limit.ts).
  """
  type Query {
    "Paged, filterable, sortable character search."
    characters(filter: CharacterFilter, page: Int, sort: CharacterSort): CharactersPage!
    "A single character by id, or null if it doesn't exist."
    character(id: ID!): Character
    "Paged episode search by name and/or code (e.g. \\"S01E01\\")."
    episodes(filter: EpisodeFilter, page: Int): EpisodesPage!
    "A single episode by id, or null if it doesn't exist."
    episode(id: ID!): Episode
    "Paged, filterable location search."
    locations(filter: LocationFilter, page: Int): LocationsPage!
    "A single location by id, or null if it doesn't exist."
    location(id: ID!): Location
    "The full location catalogue, unpaged and unfiltered."
    allLocations: [Location!]!
    "Editorial groupings (most-seen characters, unknown origins, most-populated locations) for landing/discovery surfaces."
    curatedCollections(limit: Int = 6): CuratedCollections!
    "Compares two characters by id: shared episodes and shared origin/current locations. Returns null if either id is missing or the ids match."
    compareCharacters(firstId: ID!, secondId: ID!): CharacterComparison
  }

  "Rick and Morty API-style pagination info for the current page."
  type PageInfo {
    "Total number of matching results across all pages."
    count: Int
    "Total number of pages at the current page size (20)."
    pages: Int
    "Next page number, or null on the last page."
    next: Int
    "Previous page number, or null on the first page."
    prev: Int
  }
  type CharactersPage { info: PageInfo, results: [Character] }
  type EpisodesPage { info: PageInfo, results: [Episode] }
  type LocationsPage { info: PageInfo, results: [Location] }

  type CuratedCollections {
    "Characters with the most episode appearances, descending."
    mostSeenCharacters: [Character!]!
    "Characters whose origin is missing or explicitly \\"unknown\\", sorted by name."
    charactersWithUnknownOrigins: [Character!]!
    "Locations with the most residents, descending."
    mostPopulatedLocations: [Location!]!
  }

  type CharacterComparison {
    first: Character!
    second: Character!
    "Episodes both characters appear in."
    sharedEpisodes: [Episode!]!
    "Locations that are the origin or current location of both characters."
    sharedLocations: [Location!]!
  }

  type Character {
    id: ID, name: String, image: String, status: String, species: String, gender: String
    origin: Location, location: Location, episode: [Episode]
    "Number of episodes this character appears in."
    episodeCount: Int
  }
  type Episode {
    id: ID, name: String
    "Production code, e.g. \\"S01E01\\"."
    episode: String
    air_date: String
    "Parsed from \\"episode\\"; null if it doesn't match the SxxEyy pattern."
    season: Int
    "Parsed from \\"episode\\"; null if it doesn't match the SxxEyy pattern."
    episodeNumber: Int
    characters: [Character]
  }
  type Location {
    id: ID, name: String, type: String, dimension: String
    residents: [Character]
    "Number of residents; always available even when \\"residents\\" isn't requested."
    residentCount: Int
    "Episodes that feature at least one resident of this location."
    episodesFeaturingResidents: [Episode]
  }

  "All string fields match case-insensitively as a substring, not an exact match."
  input CharacterFilter {
    name: String
    "Matches if the character's status is any of these (case-insensitive)."
    statuses: [String!]
    species: String
    gender: String
    "Matches against the character's current location's dimension, falling back to origin."
    dimension: String
    "Only characters with at least this many episode appearances."
    minEpisodes: Int
  }
  input LocationFilter { name: String, type: String, dimension: String }
  input EpisodeFilter {
    name: String
    "Matches against the episode's production code, e.g. \\"S01E01\\"."
    episode: String
  }
  enum CharacterSortField { NAME EPISODE_COUNT }
  enum SortDirection { ASC DESC }
  input CharacterSort { field: CharacterSortField = NAME, direction: SortDirection = ASC }
`;
