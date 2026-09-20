import type { CharacterEpisode } from "./character-detail";

export interface ParsedEpisodeCode {
  season: number;
  episode: number;
}

export interface CharacterEpisodeSeason {
  key: string;
  label: string;
  season: number | null;
  episodes: CharacterEpisode[];
}

const EPISODE_CODE_PATTERN = /^S(\d+)E(\d+)$/i;

/**
 * Turns an API episode code such as "S01E01" into sortable numeric values.
 * Unknown or malformed codes deliberately return null so the UI can retain
 * the episode under a clearly labelled "Other" group instead of dropping it.
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

/** Groups a character's complete episode list into ascending seasons. */
export function groupCharacterEpisodesBySeason(
  episodes: CharacterEpisode[],
): CharacterEpisodeSeason[] {
  const seasons = new Map<
    number,
    Array<{ episode: CharacterEpisode; order: number; episodeNumber: number }>
  >();
  const other: Array<{ episode: CharacterEpisode; order: number }> = [];

  episodes.forEach((episode, order) => {
    const parsed = parseEpisodeCode(episode.code);

    if (!parsed) {
      other.push({ episode, order });
      return;
    }

    const seasonEpisodes = seasons.get(parsed.season) ?? [];
    seasonEpisodes.push({
      episode,
      order,
      episodeNumber: parsed.episode,
    });
    seasons.set(parsed.season, seasonEpisodes);
  });

  const groupedSeasons: CharacterEpisodeSeason[] = [...seasons.entries()]
    .sort(([firstSeason], [secondSeason]) => firstSeason - secondSeason)
    .map(([season, seasonEpisodes]) => ({
      key: `season-${season}`,
      label: `Season ${season}`,
      season,
      episodes: seasonEpisodes
        .sort(
          (first, second) =>
            first.episodeNumber - second.episodeNumber ||
            first.order - second.order,
        )
        .map(({ episode }) => episode),
    }));

  if (other.length > 0) {
    groupedSeasons.push({
      key: "other",
      label: "Other",
      season: null,
      episodes: other
        .sort((first, second) => first.order - second.order)
        .map(({ episode }) => episode),
    });
  }

  return groupedSeasons;
}
