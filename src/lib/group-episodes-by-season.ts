import { parseEpisodeCode } from "./parse-episode-code";

export interface EpisodeSeasonGroup<T> {
  key: string;
  label: string;
  season: number | null;
  episodes: T[];
}

/**
 * Groups any episode-shaped list into ascending seasons by parsing each
 * item's `code` (e.g. "S01E01"). Generic so both a single character's
 * episode history and the full episodes catalogue can share one
 * implementation instead of two copies of the same season-bucketing logic.
 */
export function groupEpisodesBySeason<T extends { code: string }>(
  episodes: T[],
): EpisodeSeasonGroup<T>[] {
  const seasons = new Map<
    number,
    Array<{ episode: T; order: number; episodeNumber: number }>
  >();
  const other: Array<{ episode: T; order: number }> = [];

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

  const groupedSeasons: EpisodeSeasonGroup<T>[] = [...seasons.entries()]
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
