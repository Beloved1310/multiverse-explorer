export const UNKNOWN_VALUE = "Unknown";

/**
 * The API uses the literal lowercase string "unknown" as its own "no
 * value" sentinel on several fields (species, origin/location names,
 * location type/dimension -- verified directly against the live API).
 * Normalizing it here, in the one shared function every mapper already
 * routes through, means the fix applies everywhere at once instead of
 * needing a separate whitelist per field.
 */
export function normalizeText(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) return UNKNOWN_VALUE;
  if (value.trim().toLowerCase() === "unknown") return UNKNOWN_VALUE;
  return value;
}
