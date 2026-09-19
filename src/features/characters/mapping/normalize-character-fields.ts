import type { CharacterStatus } from "../domain/character";

const CHARACTER_STATUSES: readonly CharacterStatus[] = [
  "alive",
  "dead",
  "unknown",
];
const CHARACTER_GENDERS = ["female", "male", "genderless", "unknown"] as const;

/** Shared by every character mapper (list, detail) so the rules only live in one place. */
export function normalizeCharacterStatus(
  status: string | null,
): CharacterStatus {
  const normalized = status?.toLowerCase();
  return CHARACTER_STATUSES.find((known) => known === normalized) ?? "unknown";
}

export function normalizeCharacterGender(gender: string | null): string {
  const normalized = gender?.toLowerCase();
  return CHARACTER_GENDERS.find((known) => known === normalized) ?? "unknown";
}
