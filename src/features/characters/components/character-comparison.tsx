"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyIcon, MapPinIcon, UsersIcon } from "@/components/ui/icons";
import { StatusPanel } from "@/components/ui/status-panel";
import { pluralize } from "@/lib/pluralize";
import type { GetCharacterComparisonQuery as CharacterComparisonData } from "@/lib/graphql/generated/graphql";
import { EpisodeCard } from "@/features/episodes/components/episode-card";
import { mapEpisode } from "@/features/episodes/mapping/map-episode";
import { LocationCard } from "@/features/locations/components/location-card";
import { mapLocation } from "@/features/locations/mapping/map-location";
import { GetCharactersQuery } from "../api/get-characters";
import { GetCharacterComparisonQuery } from "../api/get-character-comparison";
import { STATUS_LABELS, type Character } from "../domain/character";
import { mapCharacter } from "../mapping/map-character";

const NAME_SORT = { field: "NAME" as const, direction: "ASC" as const };
type ComparisonSide = "first" | "second";
type SelectedCharacters = Partial<Record<ComparisonSide, Character>>;

export function CharacterComparison() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstId = searchParams.get("first") ?? "";
  const secondId = searchParams.get("second") ?? "";
  const [selectedCharacters, setSelectedCharacters] =
    useState<SelectedCharacters>({});

  const setCharacter = (side: ComparisonSide, character?: Character) => {
    const params = new URLSearchParams(searchParams);
    if (character) params.set(side, character.id);
    else params.delete(side);
    setSelectedCharacters((current) => ({ ...current, [side]: character }));
    router.replace(
      `${pathname}${params.size > 0 ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const swapCharacters = () => {
    if (!firstId || !secondId) return;
    const params = new URLSearchParams(searchParams);
    params.set("first", secondId);
    params.set("second", firstId);
    setSelectedCharacters(({ first, second }) => ({
      first: second,
      second: first,
    }));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const canCompare = Boolean(firstId && secondId && firstId !== secondId);
  const { data, loading } = useQuery(GetCharacterComparisonQuery, {
    variables: { firstId, secondId },
    skip: !canCompare,
  });
  const comparison = data?.compareCharacters;
  const isCurrentComparison =
    comparison?.first.id === firstId && comparison?.second.id === secondId;
  const currentComparison = isCurrentComparison ? comparison : undefined;

  const firstSelected =
    selectedCharacters.first ??
    (currentComparison ? mapCharacter(currentComparison.first) : undefined);
  const secondSelected =
    selectedCharacters.second ??
    (currentComparison ? mapCharacter(currentComparison.second) : undefined);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <BackLink label="Back to characters" />
      <header className="max-w-2xl space-y-2">
        <p className="text-caption font-semibold tracking-[0.14em] text-brand uppercase">
          Character comparison
        </p>
        <h1 className="mt-2 text-display font-bold text-foreground">
          Compare two characters
        </h1>
        <p className="mt-2 text-body text-foreground-muted">
          Choose two characters to see the episodes and places their stories
          share.
        </p>
      </header>

      <section aria-labelledby="comparison-setup-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="comparison-setup-title"
            className="text-heading font-semibold text-foreground"
          >
            Choose characters
          </h2>
          {canCompare && (
            <Button variant="secondary" onClick={swapCharacters}>
              Swap characters
            </Button>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <CharacterPicker
            label="First character"
            selected={firstSelected}
            onSelect={(character) => setCharacter("first", character)}
            onRemove={() => setCharacter("first")}
          />
          <div
            aria-hidden="true"
            className="hidden items-center justify-center lg:flex"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-brand/20 bg-brand-subtle text-body font-semibold text-brand">
              +
            </span>
          </div>
          <CharacterPicker
            label="Second character"
            selected={secondSelected}
            onSelect={(character) => setCharacter("second", character)}
            onRemove={() => setCharacter("second")}
          />
        </div>
      </section>

      {firstId === secondId && firstId && (
        <StatusPanel
          tone="brand"
          icon={<EmptyIcon className="h-6 w-6" />}
          heading="Choose two different characters."
          description="A character cannot be compared with themselves."
        />
      )}
      {!firstId && !secondId && (
        <StatusPanel
          tone="brand"
          icon={<UsersIcon className="h-6 w-6" />}
          heading="Start with two characters."
          description="Their shared episodes and places will appear here."
        />
      )}
      {firstId && !secondId && (
        <p
          role="status"
          className="rounded-card border border-brand/20 bg-brand-subtle px-4 py-3 text-body text-foreground"
        >
          First character chosen. Now choose someone to compare them with.
        </p>
      )}
      {canCompare && loading && !currentComparison && <ComparisonSkeleton />}
      {currentComparison && (
        <ComparisonResults comparison={currentComparison} />
      )}
    </main>
  );
}

function CharacterPicker({
  label,
  selected,
  onSelect,
  onRemove,
}: {
  label: string;
  selected?: Character;
  onSelect: (character: Character) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxId = useId();
  const hasSearch = name.trim().length >= 2;
  const { data } = useQuery(GetCharactersQuery, {
    variables: {
      filter: hasSearch ? { name: name.trim() } : undefined,
      page: 1,
      sort: NAME_SORT,
    },
    skip: !hasSearch,
  });
  const matches = useMemo(
    () =>
      (data?.characters?.results ?? [])
        .filter((item) => item !== null)
        .map(mapCharacter)
        .slice(0, 6),
    [data],
  );

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-caption font-semibold tracking-[0.12em] text-foreground-muted uppercase">
            {label}
          </p>
          {selected ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="min-w-0 text-heading font-semibold text-foreground">
                {selected.name}
              </span>
              <Badge tone={selected.status}>
                {STATUS_LABELS[selected.status]}
              </Badge>
            </div>
          ) : (
            <p className="mt-2 text-body text-foreground-muted">
              No character selected
            </p>
          )}
        </div>
        {selected && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-control px-2 py-1 text-caption font-medium text-foreground-muted hover:bg-surface-elevated hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            Remove
          </button>
        )}
      </div>
      <div className="relative mt-4">
        <label className="sr-only" htmlFor={`${listboxId}-input`}>
          {label}
        </label>
        <input
          id={`${listboxId}-input`}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={
            hasSearch && matches.length > 0 ? listboxId : undefined
          }
          aria-expanded={hasSearch && matches.length > 0}
          aria-activedescendant={
            hasSearch && matches[activeIndex]
              ? `${listboxId}-${matches[activeIndex].id}`
              : undefined
          }
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (!matches.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % matches.length);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex(
                (index) => (index - 1 + matches.length) % matches.length,
              );
            }
            if (event.key === "Enter" && hasSearch && matches[activeIndex]) {
              event.preventDefault();
              onSelect(matches[activeIndex]);
              setName("");
              setActiveIndex(0);
            }
            if (event.key === "Escape") setName("");
          }}
          placeholder={selected ? "Change character" : "Search by name"}
          autoComplete="off"
          className="w-full rounded-control border border-border bg-background px-3 py-2.5 text-body text-foreground placeholder:text-foreground-muted focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        />
        {matches.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="mt-2 divide-y divide-border overflow-hidden rounded-control border border-border bg-surface-elevated shadow-lg"
            aria-label={`${label} matches`}
          >
            {matches.map((character, index) => (
              <li
                key={character.id}
                id={`${listboxId}-${character.id}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(character);
                  setName("");
                  setActiveIndex(0);
                }}
                className={`cursor-pointer px-3 py-2.5 text-left ${activeIndex === index ? "bg-brand-subtle" : "hover:bg-surface-elevated"}`}
              >
                <span className="block font-medium text-foreground">
                  {character.name}
                </span>
                <span className="mt-0.5 block text-caption text-foreground-muted">
                  {character.species} · {STATUS_LABELS[character.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
        {hasSearch && matches.length === 0 && (
          <p className="mt-2 text-caption text-foreground-muted">
            No characters found. Try another name.
          </p>
        )}
      </div>
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
    <div className="space-y-8" aria-live="polite">
      <section
        aria-labelledby="comparison-summary-title"
        className="rounded-card border border-brand/20 bg-brand-subtle p-5 sm:p-6"
      >
        <p className="text-caption font-semibold tracking-[0.12em] text-brand uppercase">
          Shared story
        </p>
        <h2
          id="comparison-summary-title"
          className="mt-1 text-heading font-semibold text-foreground"
        >
          {first.name} and {second.name}
        </h2>
        <p className="mt-2 text-body text-foreground-muted">
          They share {episodes.length} {pluralize("episode", episodes.length)}{" "}
          and {locations.length} {pluralize("location", locations.length)}.
        </p>
      </section>
      <section
        className="grid gap-4 sm:grid-cols-2"
        aria-label="Selected characters"
      >
        <ComparisonProfile character={first} label="First character" />
        <ComparisonProfile character={second} label="Second character" />
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

function ComparisonProfile({
  character,
  label,
}: {
  character: Character;
  label: string;
}) {
  return (
    <Link
      href={`/characters/${character.id}`}
      aria-label={`View ${character.name}'s character details`}
      className="group rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card className="h-full overflow-hidden transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-lg group-hover:shadow-brand/10 motion-reduce:transition-none">
        <div className="grid grid-cols-[5.5rem_1fr] gap-4 p-4 sm:grid-cols-[7rem_1fr] sm:p-5">
          <div className="relative aspect-square overflow-hidden rounded-control bg-brand-subtle">
            {character.imageUrl ? (
              <Image
                src={character.imageUrl}
                alt={`Portrait of ${character.name}`}
                fill
                loading="eager"
                sizes="(min-width: 640px) 7rem, 5.5rem"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-caption text-foreground-muted">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-caption font-medium text-foreground-muted">
              {label}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-heading font-semibold text-foreground group-hover:text-brand">
                {character.name}
              </h3>
              <Badge tone={character.status}>
                {STATUS_LABELS[character.status]}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-caption">
              <div>
                <dt className="text-foreground-muted">Species</dt>
                <dd className="mt-0.5 truncate font-medium text-foreground">
                  {character.species}
                </dd>
              </div>
              <div>
                <dt className="text-foreground-muted">Episodes</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {character.episodes.length}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="flex items-center gap-1 text-foreground-muted">
                  <MapPinIcon className="h-3.5 w-3.5" /> Last known location
                </dt>
                <dd className="mt-0.5 truncate font-medium text-foreground">
                  {character.location}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading comparison" role="status">
      <div className="h-28 animate-pulse rounded-card bg-foreground-muted/15 motion-reduce:animate-none" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 animate-pulse rounded-card bg-foreground-muted/15 motion-reduce:animate-none" />
        <div className="h-44 animate-pulse rounded-card bg-foreground-muted/15 motion-reduce:animate-none" />
      </div>
      <span className="sr-only">Loading comparison</span>
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
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-2">
        <h2 className="text-heading font-semibold text-foreground">{title}</h2>
        <span className="text-caption text-foreground-muted">
          {items.length}{" "}
          {pluralize(
            title === "Shared episodes" ? "episode" : "location",
            items.length,
          )}
        </span>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      ) : (
        <p className="text-caption text-foreground-muted">{empty}</p>
      )}
    </section>
  );
}
