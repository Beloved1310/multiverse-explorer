import type { DeepPartial } from "@apollo/client/utilities";
import type { GetLocationQuery } from "@/lib/graphql/generated/graphql";
import { mapCharacter } from "@/features/characters/mapping/map-character";
import { mapEpisode } from "@/features/episodes/mapping/map-episode";
import { normalizeText } from "@/lib/normalize-text";
import type { LocationDetail } from "../domain/location-detail";

type FullApiLocationDetail = NonNullable<GetLocationQuery["location"]>;

/**
 * `returnPartialData` (enabled on the query this feeds) means every field,
 * at every depth, can genuinely be missing at runtime -- see
 * map-character-detail.ts for the original reasoning this mirrors.
 */
export type ApiLocationDetail = DeepPartial<FullApiLocationDetail>;

export function mapLocationDetail(
  apiLocation: ApiLocationDetail,
): LocationDetail {
  return {
    id: apiLocation.id ?? "",
    name: normalizeText(apiLocation.name),
    type: normalizeText(apiLocation.type),
    dimension: normalizeText(apiLocation.dimension),
    residents: (apiLocation.residents ?? [])
      .filter((resident) => resident !== null && resident !== undefined)
      .map((resident) => mapCharacter(resident)),
    episodesFeaturingResidents: (apiLocation.episodesFeaturingResidents ?? [])
      .filter((episode) => episode !== null && episode !== undefined)
      .map((episode) => mapEpisode(episode)),
  };
}
