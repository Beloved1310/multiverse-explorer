export const UNKNOWN_VALUE = "Unknown";

export function normalizeText(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : UNKNOWN_VALUE;
}
