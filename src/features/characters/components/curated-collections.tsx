"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { mapLocation } from "@/features/locations/mapping/map-location";
import { LocationCard } from "@/features/locations/components/location-card";
import { mapCharacter } from "../mapping/map-character";
import { GetCuratedCollectionsQuery } from "../api/get-curated-collections";
import { CharacterCard } from "./character-card";

const LIMIT = 3;

export function CuratedCollections() {
  const { data, loading, error } = useQuery(GetCuratedCollectionsQuery, {
    variables: { limit: LIMIT },
  });

  if (error) return null;

  const collections = data?.curatedCollections;
  const mostSeen = (collections?.mostSeenCharacters ?? [])
    .filter((character) => character !== null)
    .map(mapCharacter);
  const unknownOrigins = (collections?.charactersWithUnknownOrigins ?? [])
    .filter((character) => character !== null)
    .map(mapCharacter);
  const populatedLocations = (collections?.mostPopulatedLocations ?? [])
    .filter((location) => location !== null)
    .map(mapLocation);

  return (
    <section
      className="w-full space-y-10 text-left"
      aria-labelledby="curated-title"
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="text-caption font-semibold tracking-[0.14em] text-brand uppercase">
          Curated routes
        </p>
        <h2
          id="curated-title"
          className="mt-2 font-display text-3xl font-semibold text-foreground"
        >
          Start somewhere surprising
        </h2>
      </div>

      <Collection
        title="Most seen"
        href="/characters?sort=episodes-desc"
        linkLabel="See all characters"
      >
        {loading ? (
          <CardsLoading />
        ) : (
          mostSeen.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))
        )}
      </Collection>
      <Collection
        title="Unknown origins"
        href="/characters"
        linkLabel="Explore characters"
      >
        {loading ? (
          <CardsLoading />
        ) : (
          unknownOrigins.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))
        )}
      </Collection>
      <Collection
        title="Most residents"
        href="/locations"
        linkLabel="Explore locations"
      >
        {loading ? (
          <CardsLoading />
        ) : (
          populatedLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))
        )}
      </Collection>
    </section>
  );
}

function Collection({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="text-heading font-semibold text-foreground">{title}</h3>
        <Link
          href={href}
          className="text-caption font-medium text-brand hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function CardsLoading() {
  return (
    <>
      {Array.from({ length: LIMIT }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
}
