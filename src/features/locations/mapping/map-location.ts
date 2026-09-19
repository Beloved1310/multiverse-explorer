import type { GetLocationsQuery } from "@/lib/graphql/generated/graphql";
import { normalizeText } from "@/lib/normalize-text";
import type { Location, LocationResident } from "../domain/location";

export type ApiLocation = NonNullable<
  NonNullable<NonNullable<GetLocationsQuery["locations"]>["results"]>[number]
>;

type ApiResident = NonNullable<ApiLocation["residents"][number]>;

function mapResident(resident: ApiResident): LocationResident {
  return {
    id: resident.id ?? "",
    name: normalizeText(resident.name),
  };
}

export function mapLocation(apiLocation: ApiLocation): Location {
  return {
    id: apiLocation.id ?? "",
    name: normalizeText(apiLocation.name),
    type: normalizeText(apiLocation.type),
    dimension: normalizeText(apiLocation.dimension),
    residents: apiLocation.residents
      .filter((resident) => resident !== null)
      .map(mapResident),
  };
}
