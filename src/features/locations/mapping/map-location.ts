import type { GetLocationsQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type { Location } from "../domain/location";

export type ApiLocation = NonNullable<
  NonNullable<NonNullable<GetLocationsQuery["locations"]>["results"]>[number]
>;

export function mapLocation(apiLocation: ApiLocation): Location {
  return {
    id: apiLocation.id ?? "",
    name: normalizeText(apiLocation.name),
    type: normalizeText(apiLocation.type),
    dimension: normalizeText(apiLocation.dimension),
    residentCount: (apiLocation.residents ?? []).filter(
      (resident) => resident !== null,
    ).length,
  };
}
