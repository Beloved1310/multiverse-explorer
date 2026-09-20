import type { GetEpisodesQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type { Episode } from "../domain/episode";

export type ApiEpisode = NonNullable<
  NonNullable<NonNullable<GetEpisodesQuery["episodes"]>["results"]>[number]
>;

export function mapEpisode(apiEpisode: ApiEpisode): Episode {
  return {
    id: apiEpisode.id ?? "",
    name: normalizeText(apiEpisode.name),
    code: normalizeText(apiEpisode.episode),
    airDate: normalizeText(apiEpisode.air_date),
    characterCount: apiEpisode.characters.filter(
      (character) => character !== null,
    ).length,
  };
}
