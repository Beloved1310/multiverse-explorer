"use client";

import { useQuery } from "@apollo/client/react";
import { GetLocationQuery } from "../api/get-location";
import { mapLocationDetail } from "../mapping/map-location-detail";
import type { LocationDetail } from "../domain/location-detail";

interface UseLocationDetailResult {
  location: LocationDetail | null;
  loading: boolean;
  error: boolean;
  notFound: boolean;
  refetch: () => void;
}

/**
 * `returnPartialData` lets whatever's already cached (e.g. name/type from
 * the list this was opened from) render immediately, alongside
 * `loading: true`, while the rest of the query -- the full residents
 * list -- is still in flight. Mirrors useCharacterDetail.
 */
export function useLocationDetail(id: string): UseLocationDetailResult {
  const { data, loading, error, refetch } = useQuery(GetLocationQuery, {
    variables: { id },
    returnPartialData: true,
    notifyOnNetworkStatusChange: true,
  });

  const location = data?.location ? mapLocationDetail(data.location) : null;

  return {
    location,
    loading,
    error: Boolean(error),
    notFound: !loading && data?.location === null,
    refetch: () => {
      void refetch();
    },
  };
}
