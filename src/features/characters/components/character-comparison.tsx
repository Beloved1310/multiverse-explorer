"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { Card } from "@/components/ui/card";
import { StatusPanel } from "@/components/ui/status-panel";
import { EmptyIcon } from "@/components/ui/icons";
import { EpisodeCard } from "@/features/episodes/components/episode-card";
import { mapEpisode } from "@/features/episodes/mapping/map-episode";
import { LocationCard } from "@/features/locations/components/location-card";
import { mapLocation } from "@/features/locations/mapping/map-location";
import type { GetCharacterComparisonQuery as CharacterComparisonData } from "@/lib/graphql/generated/graphql";
import { GetCharactersQuery } from "../api/get-characters";
import { GetCharacterComparisonQuery } from "../api/get-character-comparison";
import { mapCharacter } from "../mapping/map-character";
import { CharacterCard } from "./character-card";

const NAME_SORT = { field: "NAME" as const, direction: "ASC" as const };

export function CharacterComparison() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstId = searchParams.get("first") ?? "";
  const secondId = searchParams.get("second") ?? "";

  const setCharacter = (side: "first" | "second", id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(side, id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data, loading } = useQuery(GetCharacterComparisonQuery, {
    variables: { firstId, secondId },
    skip: !firstId || !secondId || firstId === secondId,
  });
  const comparison = data?.compareCharacters;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <BackLink label="Back to characters" />
      <div>
        <p className="text-caption font-semibold tracking-[0.14em] text-brand uppercase">
          Character comparison
        </p>
        <h1 className="mt-2 text-display font-bold text-foreground">
          Find what two lives have in common
        </h1>
        <p className="mt-2 text-body text-foreground-muted">
          Choose two characters to compare shared episodes and locations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CharacterPicker
          label="First character"
          selectedId={firstId}
          onSelect={(id) => setCharacter("first", id)}
        />
        <CharacterPicker
          label="Second character"
          selectedId={secondId}
          onSelect={(id) => setCharacter("second", id)}
        />
      </div>

      {firstId === secondId && firstId && (
        <StatusPanel
          tone="brand"
          icon={<EmptyIcon className="h-6 w-6" />}
          heading="Choose two different characters."
          description="A character cannot be compared with themselves."
        />
      )}
      {loading && (
        <p className="text-body text-foreground-muted">
          Comparing their paths…
        </p>
      )}
      {!loading && comparison && <ComparisonResults comparison={comparison} />}
    </main>
  );
}

function CharacterPicker({
  label,
  selectedId,
  onSelect,
}: {
  label: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const { data } = useQuery(GetCharactersQuery, {
    variables: {
      filter: name.trim() ? { name: name.trim() } : undefined,
      page: 1,
      sort: NAME_SORT,
    },
    skip: name.trim().length < 2,
  });
  const matches = useMemo(
    () =>
      (data?.characters?.results ?? [])
        .filter((item) => item !== null)
        .slice(0, 6),
    [data],
  );

  return (
    <Card className="p-4">
      <label
        className="text-caption font-medium text-foreground-muted"
        htmlFor={`${label}-search`}
      >
        {label}
      </label>
      <input
        id={`${label}-search`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Search by name"
        className="mt-2 w-full rounded-control border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      />
      {selectedId && (
        <p className="mt-2 text-caption text-foreground-muted">
          Character selected
        </p>
      )}
      {matches.length > 0 && (
        <ul
          className="mt-3 divide-y divide-border"
          aria-label={`${label} matches`}
        >
          {matches.map((character) => (
            <li key={character.id ?? "unknown"}>
              <button
                type="button"
                onClick={() => character.id && onSelect(character.id)}
                className="w-full px-1 py-2 text-left text-body text-foreground hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                {character.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ComparisonResults({
  comparison,
}: {
  comparison: NonNullable<CharacterComparisonData["compareCharacters"]>;
}) {
  const first = mapCharacter(comparison.first);
  const second = mapCharacter(comparison.second);
  const episodes = comparison.sharedEpisodes
    .filter((episode) => episode !== null)
    .map(mapEpisode);
  const locations = comparison.sharedLocations
    .filter((location) => location !== null)
    .map(mapLocation);
  return (
    <div className="space-y-8">
      <section
        className="grid gap-6 sm:grid-cols-2"
        aria-label="Selected characters"
      >
        <CharacterCard character={first} eagerImage />
        <CharacterCard character={second} eagerImage />
      </section>
      <RelatedGrid
        title="Shared episodes"
        empty="No shared episodes on record."
      >
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </RelatedGrid>
      <RelatedGrid
        title="Shared locations"
        empty="No shared origin or current location."
      >
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </RelatedGrid>
    </div>
  );
}

function RelatedGrid({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <section>
      <h2 className="mb-4 text-heading font-semibold text-foreground">
        {title}
      </h2>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      ) : (
        <p className="text-caption text-foreground-muted">{empty}</p>
      )}
    </section>
  );
}
