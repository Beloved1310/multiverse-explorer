"use client";

import Image from "next/image";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusPanel } from "@/components/ui/status-panel";
import {
  AlertIcon,
  CalendarIcon,
  EmptyIcon,
  SpinnerIcon,
} from "@/components/ui/icons";
import type {
  CharacterEpisode,
  CharacterLocationRef,
} from "../domain/character-detail";
import { STATUS_LABELS } from "../domain/character";
import { useCharacterDetail } from "../hooks/use-character-detail";

// The domain model deliberately keeps gender lowercase (see
// normalize-character-fields.ts); this is purely a display concern.
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface CharacterDetailViewProps {
  id: string;
}

export function CharacterDetailView({ id }: CharacterDetailViewProps) {
  const { character, loading, notFound, refetch } = useCharacterDetail(id);

  if (!character) {
    if (loading) return <DetailSkeleton />;
    if (notFound) return <NotFoundState />;
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <BackLink label="Back to the multiverse" />

      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 sm:grid-cols-[16rem_1fr] sm:p-8">
          <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-card bg-surface-elevated sm:mx-0">
            {character.imageUrl ? (
              <Image
                src={character.imageUrl}
                alt={`Portrait of ${character.name}`}
                fill
                priority
                sizes="(min-width: 640px) 16rem, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center text-caption text-foreground-muted"
              >
                No image
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-display font-bold text-foreground">
                {character.name}
              </h2>
              <Badge tone={character.status}>
                {STATUS_LABELS[character.status]}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body">
              <Attribute label="Species" value={character.species} />
              <Attribute label="Gender" value={capitalize(character.gender)} />
              <Attribute label="Origin">
                <LocationRefValue location={character.origin} />
              </Attribute>
              <Attribute label="Last known location">
                <LocationRefValue location={character.location} />
              </Attribute>
            </dl>
          </div>
        </div>
      </Card>

      <EpisodesSection episodes={character.episodes} stillLoading={loading} />
    </div>
  );
}

interface AttributeProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
}

function Attribute({ label, value, children }: AttributeProps) {
  return (
    <div>
      <dt className="text-caption text-foreground-muted">{label}</dt>
      <dd className="font-medium text-foreground">{children ?? value}</dd>
    </div>
  );
}

function LocationRefValue({ location }: { location: CharacterLocationRef }) {
  if (!location.id) {
    return <span>{location.name}</span>;
  }

  return (
    <Link
      href={`/locations/${location.id}`}
      className="text-brand underline-offset-2 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
    >
      {location.name}
    </Link>
  );
}

function EpisodesSection({
  episodes,
  stillLoading,
}: {
  episodes: CharacterEpisode[];
  stillLoading: boolean;
}) {
  return (
    <Card className="p-6 sm:p-8">
      <h3 className="mb-4 text-heading font-semibold text-foreground">
        Episode appearances
      </h3>

      {episodes.length === 0 && stillLoading && (
        <p className="flex items-center gap-2 text-caption text-foreground-muted">
          <SpinnerIcon className="h-4 w-4 text-brand" />
          Loading episodes&hellip;
        </p>
      )}

      {episodes.length === 0 && !stillLoading && (
        <p className="text-caption text-foreground-muted">
          No episode appearances on record.
        </p>
      )}

      {episodes.length > 0 && (
        <ul className="divide-y divide-border">
          {episodes.map((episode, index) => (
            <li
              // The list this page was opened from only ever fetches
              // `episode { name }` -- no id. During the brief window
              // where `returnPartialData` is rendering that
              // already-cached (id-less) data before the network
              // response with real ids arrives, every episode's `id`
              // would otherwise be "" simultaneously. Falling back to
              // the index keeps keys unique through that transition.
              key={episode.id || index}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-control bg-brand-subtle px-2 py-1 text-caption font-semibold text-brand">
                  {episode.code}
                </span>
                <span className="text-body text-foreground">
                  {episode.name}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-caption text-foreground-muted">
                <CalendarIcon className="h-3.5 w-3.5" />
                {episode.airDate}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-4 w-32 animate-pulse rounded bg-foreground-muted/20" />
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 sm:grid-cols-[16rem_1fr] sm:p-8">
          <div className="mx-auto aspect-square w-full max-w-xs animate-pulse rounded-card bg-foreground-muted/20 sm:mx-0" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-foreground-muted/20" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-foreground-muted/20" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 animate-pulse rounded bg-foreground-muted/20"
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="space-y-6">
      <BackLink label="Back to the multiverse" />
      <StatusPanel
        tone="brand"
        icon={<EmptyIcon className="h-6 w-6" />}
        heading="This being doesn't exist in any reality we've found."
        description="Double-check the link, or head back and search the multiverse."
      />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <BackLink label="Back to the multiverse" />
      <StatusPanel
        tone="danger"
        icon={<AlertIcon className="h-6 w-6" />}
        heading="Something glitched in this dimension."
        description="We couldn't reach the multiverse's database. Check your connection and try again."
        action={<Button onClick={onRetry}>Retry</Button>}
      />
    </div>
  );
}
