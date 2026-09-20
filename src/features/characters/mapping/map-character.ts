import type { DeepPartial } from "@apollo/client/utilities";
import type { GetCharactersQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type { Character } from "../domain/character";
import {
  normalizeCharacterGender,
  normalizeCharacterStatus,
} from "./normalize-character-fields";

export type ApiCharacter = NonNullable<
  NonNullable<NonNullable<GetCharactersQuery["characters"]>["results"]>[number]
>;

/**
 * Accepts `DeepPartial<ApiCharacter>`, not just the full shape: this mapper
 * is reused for location residents and episode casts (see
 * map-location-detail.ts, map-episode-detail.ts), both of which enable
 * `returnPartialData` on their detail queries -- so a resident/cast member
 * can genuinely arrive with fields still missing, the same way
 * map-character-detail.ts already had to account for. A fully-populated
 * `ApiCharacter` still satisfies this wider type, so the characters list
 * (which never uses partial data) is unaffected.
 */
export function mapCharacter(
  apiCharacter: DeepPartial<ApiCharacter>,
): Character {
  return {
    id: apiCharacter.id ?? "",
    name: normalizeText(apiCharacter.name),
    imageUrl: apiCharacter.image ?? "",
    status: normalizeCharacterStatus(apiCharacter.status ?? null),
    species: normalizeText(apiCharacter.species),
    gender: normalizeCharacterGender(apiCharacter.gender ?? null),
    origin: normalizeText(apiCharacter.origin?.name),
    location: normalizeText(apiCharacter.location?.name),
    episodes: (apiCharacter.episode ?? [])
      .filter((episode) => episode !== null && episode !== undefined)
      .map((episode) => normalizeText(episode.name)),
  };
}
