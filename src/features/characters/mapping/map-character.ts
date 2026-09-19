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

export function mapCharacter(apiCharacter: ApiCharacter): Character {
  return {
    id: apiCharacter.id ?? "",
    name: normalizeText(apiCharacter.name),
    imageUrl: apiCharacter.image ?? "",
    status: normalizeCharacterStatus(apiCharacter.status),
    species: normalizeText(apiCharacter.species),
    gender: normalizeCharacterGender(apiCharacter.gender),
    origin: normalizeText(apiCharacter.origin?.name),
    location: normalizeText(apiCharacter.location?.name),
    episodes: apiCharacter.episode
      .filter((episode) => episode !== null)
      .map((episode) => normalizeText(episode.name)),
  };
}
