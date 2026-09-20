/** Appends "s" for any count other than exactly 1. Good enough for every noun this app pluralizes (character, episode, location, resident, filter). */
export function pluralize(noun: string, count: number): string {
  return count === 1 ? noun : `${noun}s`;
}
