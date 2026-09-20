"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  CreateSavedCharacterFilterMutation,
  DeleteSavedCharacterFilterMutation,
  GetSavedCharacterFiltersQuery,
  ImportSavedCharacterFiltersMutation,
} from "../api/saved-character-filters";
import type { CharacterFilters } from "../filters/character-filters";
import {
  clearLegacySavedFilters,
  readLegacySavedFilters,
  type LegacySavedCharacterFilter,
} from "./legacy-saved-character-filters";

export interface SavedCharacterFilter {
  id: string;
  name: string;
  filters: CharacterFilters;
}

type SavedFilterResult = {
  id: string;
  name: string;
  filter: {
    name: string;
    statuses: string[];
    species: string;
    gender: string;
    dimension: string;
    minEpisodes: number | null;
    sort: { field: "NAME" | "EPISODE_COUNT"; direction: "ASC" | "DESC" };
  };
};

function mapSavedFilter(filter: SavedFilterResult): SavedCharacterFilter {
  const { filter: values } = filter;
  return {
    id: filter.id,
    name: filter.name,
    filters: {
      name: values.name,
      statuses: values.statuses,
      species: values.species,
      gender: values.gender,
      dimension: values.dimension,
      minEpisodes:
        values.minEpisodes === null ? "" : String(values.minEpisodes),
      sort:
        values.sort.field === "EPISODE_COUNT"
          ? values.sort.direction === "DESC"
            ? "episodes-desc"
            : "episodes-asc"
          : values.sort.direction === "DESC"
            ? "name-desc"
            : "name-asc",
    },
  };
}

function toInput(name: string, filters: CharacterFilters) {
  const [field, direction] = filters.sort.split("-");
  return {
    name,
    filter: {
      name: filters.name || null,
      statuses: filters.statuses,
      species: filters.species || null,
      gender: filters.gender || null,
      dimension: filters.dimension || null,
      minEpisodes: filters.minEpisodes ? Number(filters.minEpisodes) : null,
      sort: {
        field: field === "episodes" ? "EPISODE_COUNT" : "NAME",
        direction: direction === "desc" ? "DESC" : "ASC",
      },
    },
  } as const;
}

function legacyInputs(filters: LegacySavedCharacterFilter[]) {
  return filters.map((item) => toInput(item.name, item.filters));
}

export function useSavedCharacterFilters() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const [legacyFilters, setLegacyFilters] = useState<
    LegacySavedCharacterFilter[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const savedFiltersQuery = useQuery(GetSavedCharacterFiltersQuery, {
    skip: !user,
  });
  const [create] = useMutation(CreateSavedCharacterFilterMutation, {
    refetchQueries: [GetSavedCharacterFiltersQuery],
  });
  const [remove] = useMutation(DeleteSavedCharacterFilterMutation, {
    refetchQueries: [GetSavedCharacterFiltersQuery],
  });
  const [importFilters, { loading: importing }] = useMutation(
    ImportSavedCharacterFiltersMutation,
    { refetchQueries: [GetSavedCharacterFiltersQuery] },
  );

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      setLegacyFilters(readLegacySavedFilters());
    });
    return () => window.clearTimeout(timer);
  }, [user]);

  const saveFilter = useCallback(
    async (name: string, filters: CharacterFilters) => {
      setError(null);
      try {
        await create({ variables: { input: toInput(name, filters) } });
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Could not save search.",
        );
        return false;
      }
    },
    [create],
  );

  const deleteFilter = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await remove({ variables: { id } });
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Could not delete search.",
        );
      }
    },
    [remove],
  );

  const importLegacyFilters = useCallback(async () => {
    if (!legacyFilters.length) return;
    setError(null);
    try {
      await importFilters({
        variables: { inputs: legacyInputs(legacyFilters) },
      });
      clearLegacySavedFilters();
      setLegacyFilters([]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not import saved searches.",
      );
    }
  }, [importFilters, legacyFilters]);

  return {
    isSignedIn: Boolean(user),
    isLoading:
      session.isPending || (Boolean(user) && savedFiltersQuery.loading),
    savedFilters: (savedFiltersQuery.data?.savedCharacterFilters ?? []).map(
      mapSavedFilter,
    ),
    saveFilter,
    deleteFilter,
    legacyFilterCount: legacyFilters.length,
    importLegacyFilters,
    importing,
    error,
  };
}
