import type { DeepPartial } from "@apollo/client/utilities";
import type { GetCharacterQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type {
  CharacterDetail,
  CharacterEpisodeSeasonSummary,
  CharacterLocationRef,
} from "../domain/character-detail";
import {
  normalizeCharacterGender,
  normalizeCharacterStatus,
} from "./normalize-character-fields";

type FullApiCharacterDetail = NonNullable<GetCharacterQuery["character"]>;
type FullApiLocationRef = NonNullable<FullApiCharacterDetail["origin"]>;
type FullApiEpisodeSeason = NonNullable<
  NonNullable<FullApiCharacterDetail["episodeSeasons"]>[number]
>;

/**
 * `returnPartialData` (used so name/image can render before the episode
 * summary arrives) means Apollo itself types the query result as a
 * `DeepPartial` -- every field, at every depth, can genuinely be
 * `undefined` at runtime, not just the top-level ones. The mapper's input
 * type reflects that honestly instead of casting it away.
 */
export type ApiCharacterDetail = DeepPartial<FullApiCharacterDetail>;
type ApiLocationRef = DeepPartial<FullApiLocationRef>;
type ApiEpisodeSeason = DeepPartial<FullApiEpisodeSeason>;

function mapLocationRef(
  apiLocationRef: ApiLocationRef | null | undefined,
): CharacterLocationRef {
  return {
    id: apiLocationRef?.id ?? null,
    name: normalizeText(apiLocationRef?.name),
  };
}

function mapEpisodeSeason(
  apiSeason: ApiEpisodeSeason,
): CharacterEpisodeSeasonSummary {
  return {
    season: apiSeason.season ?? null,
    count: apiSeason.count ?? 0,
  };
}

export function mapCharacterDetail(
  apiCharacter: ApiCharacterDetail,
): CharacterDetail {
  return {
    id: apiCharacter.id ?? "",
    name: normalizeText(apiCharacter.name),
    imageUrl: apiCharacter.image ?? "",
    status: normalizeCharacterStatus(apiCharacter.status ?? null),
    species: normalizeText(apiCharacter.species),
    gender: normalizeCharacterGender(apiCharacter.gender ?? null),
    origin: mapLocationRef(apiCharacter.origin),
    location: mapLocationRef(apiCharacter.location),
    episodeCount: apiCharacter.episodeCount ?? 0,
    // Genuinely absent at runtime whenever this field hasn't arrived from
    // the network yet -- `?? []` renders an empty season list for that
    // instant rather than throwing.
    episodeSeasons: (apiCharacter.episodeSeasons ?? [])
      .filter((season) => season !== null && season !== undefined)
      .map((season) => mapEpisodeSeason(season)),
  };
}
