import { parseEpisodeCode } from "@/lib/parse-episode-code";
import type { CharacterEpisode } from "./character-detail";

export interface CharacterEpisodeSeason {
  key: string;
  label: string;
  season: number | null;
  episodes: CharacterEpisode[];
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
