"use client";

import { useQuery } from "@apollo/client/react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import {
  toGraphQLCharacterFilter,
  type CharacterFilters,
} from "../filters/character-filters";
import { GetSearchRecoveryQuery } from "../api/get-search-recovery";

interface SearchRecoveryProps {
  filters: CharacterFilters;
  onFiltersChange: (patch: Partial<CharacterFilters>) => void;
}

export function SearchRecovery({
  filters,
  onFiltersChange,
}: SearchRecoveryProps) {
  const input = toGraphQLCharacterFilter(filters);
  const { data, loading } = useQuery(GetSearchRecoveryQuery, {
    variables: { input: input ?? {} },
    skip: !input,
  });
  const recovery = data?.searchRecovery;

  if (loading || !recovery) return null;

  return (
    <Card className="mt-4 border-brand/25 bg-brand-subtle/30 p-5">
      <p className="text-caption font-semibold tracking-[0.12em] text-brand uppercase">
        Search recovery
      </p>
      <h2 className="mt-2 text-heading font-semibold text-foreground">
        No exact match. Let&apos;s try one detail.
      </h2>
      <p className="mt-1 text-body text-foreground-muted">
        {recovery.question}
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="list">
        {recovery.options.map((option) => (
          <div key={`${recovery.step}-${option.value}`} role="listitem">
            <button
              type="button"
              aria-label={`${option.label}, ${formatNumber(option.count)} ${option.count === 1 ? "match" : "matches"}`}
              onClick={() =>
                onFiltersChange({
                  name: option.filter.name ?? "",
                  statuses: option.filter.statuses,
                  species: option.filter.species ?? "",
                  gender: option.filter.gender ?? "",
                  dimension: option.filter.dimension ?? "",
                  minEpisodes:
                    option.filter.minEpisodes === null ||
                    option.filter.minEpisodes === undefined
                      ? ""
                      : String(option.filter.minEpisodes),
                })
              }
              className="rounded-control border border-border bg-background px-3 py-2 text-left text-body font-medium text-foreground hover:border-brand/40 hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {option.label}
              <span className="ml-2 text-caption font-normal text-foreground-muted">
                {formatNumber(option.count)} match
                {option.count === 1 ? "" : "es"}
              </span>
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
