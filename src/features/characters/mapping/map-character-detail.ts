import type { DeepPartial } from "@apollo/client/utilities";
import type { GetCharacterQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type {
  CharacterDetail,
  CharacterEpisode,
  CharacterLocationRef,
} from "../domain/character-detail";
import {
  normalizeCharacterGender,
  normalizeCharacterStatus,
} from "./normalize-character-fields";

type FullApiCharacterDetail = NonNullable<GetCharacterQuery["character"]>;
type FullApiLocationRef = NonNullable<FullApiCharacterDetail["origin"]>;
type FullApiEpisode = NonNullable<
  NonNullable<FullApiCharacterDetail["episode"]>[number]
>;

/**
 * `returnPartialData` (used so name/image can render before episodes
 * arrive) means Apollo itself types the query result as a `DeepPartial` --
 * every field, at every depth, can genuinely be `undefined` at runtime,
 * not just the top-level ones. The mapper's input type reflects that
 * honestly instead of casting it away.
 */
export type ApiCharacterDetail = DeepPartial<FullApiCharacterDetail>;
type ApiLocationRef = DeepPartial<FullApiLocationRef>;
type ApiEpisode = DeepPartial<FullApiEpisode>;

function mapLocationRef(
  apiLocationRef: ApiLocationRef | null | undefined,
): CharacterLocationRef {
  return {
    id: apiLocationRef?.id ?? null,
    name: normalizeText(apiLocationRef?.name),
  };
}

function mapEpisode(apiEpisode: ApiEpisode): CharacterEpisode {
  return {
    id: apiEpisode.id ?? "",
    name: normalizeText(apiEpisode.name),
    code: normalizeText(apiEpisode.episode),
    airDate: normalizeText(apiEpisode.air_date),
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
    // Genuinely absent at runtime whenever this field hasn't arrived from
    // the network yet -- `?? []` renders an empty episode list for that
    // instant rather than throwing.
    episodes: (apiCharacter.episode ?? [])
      .filter((episode) => episode !== null && episode !== undefined)
      .map((episode) => mapEpisode(episode)),
  };
}
