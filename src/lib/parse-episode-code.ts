export interface ParsedEpisodeCode {
  season: number;
  episode: number;
}

const EPISODE_CODE_PATTERN = /^S(\d+)E(\d+)$/i;

/**
 * Turns an API episode code such as "S01E01" into sortable numeric values.
 * Unknown or malformed codes deliberately return null so callers can retain
 * the episode under a clearly labelled fallback instead of dropping it.
 */
export function parseEpisodeCode(code: string): ParsedEpisodeCode | null {
  const match = EPISODE_CODE_PATTERN.exec(code.trim());
  if (!match) return null;

  const season = Number(match[1]);
  const episode = Number(match[2]);

  if (
    !Number.isSafeInteger(season) ||
    !Number.isSafeInteger(episode) ||
    season < 1 ||
    episode < 1
  ) {
    return null;
  }

  return { season, episode };
}
