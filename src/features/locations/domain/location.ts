export interface LocationResident {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  dimension: string;
  residents: LocationResident[];
}
