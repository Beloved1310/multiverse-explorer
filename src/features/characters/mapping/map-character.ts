import type { GetCharactersQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type { Character, CharacterStatus } from "../domain/character";

export type ApiCharacter = NonNullable<
  NonNullable<NonNullable<GetCharactersQuery["characters"]>["results"]>[number]
>;

const CHARACTER_STATUSES: readonly CharacterStatus[] = [
  "alive",
  "dead",
  "unknown",
];
const CHARACTER_GENDERS = ["female", "male", "genderless", "unknown"] as const;

function normalizeStatus(status: string | null): CharacterStatus {
  const normalized = status?.toLowerCase();
  return CHARACTER_STATUSES.find((known) => known === normalized) ?? "unknown";
}

function normalizeGender(gender: string | null): string {
  const normalized = gender?.toLowerCase();
  return CHARACTER_GENDERS.find((known) => known === normalized) ?? "unknown";
}

export function mapCharacter(apiCharacter: ApiCharacter): Character {
  return {
    id: apiCharacter.id ?? "",
    name: normalizeText(apiCharacter.name),
    imageUrl: apiCharacter.image ?? "",
    status: normalizeStatus(apiCharacter.status),
    species: normalizeText(apiCharacter.species),
    gender: normalizeGender(apiCharacter.gender),
    origin: normalizeText(apiCharacter.origin?.name),
    location: normalizeText(apiCharacter.location?.name),
    episodes: apiCharacter.episode
      .filter((episode) => episode !== null)
      .map((episode) => normalizeText(episode.name)),
  };
}
