import type { DeepPartial } from "@apollo/client/utilities";
import type { GetEpisodeQuery } from "@/lib/graphql/generated/graphql";
import { mapCharacter } from "@/features/characters/mapping/map-character";
import { normalizeText } from "@/lib/normalize-text";
import type { EpisodeDetail } from "../domain/episode-detail";

type FullApiEpisodeDetail = NonNullable<GetEpisodeQuery["episode"]>;

/**
 * `returnPartialData` (enabled on the query this feeds) means every field,
 * at every depth, can genuinely be missing at runtime -- see
 * map-character-detail.ts for the original reasoning this mirrors.
 */
export type ApiEpisodeDetail = DeepPartial<FullApiEpisodeDetail>;

export function mapEpisodeDetail(apiEpisode: ApiEpisodeDetail): EpisodeDetail {
  return {
    id: apiEpisode.id ?? "",
    name: normalizeText(apiEpisode.name),
    code: normalizeText(apiEpisode.episode),
    airDate: normalizeText(apiEpisode.air_date),
    characters: (apiEpisode.characters ?? [])
      .filter((character) => character !== null && character !== undefined)
      .map((character) => mapCharacter(character)),
  };
}
