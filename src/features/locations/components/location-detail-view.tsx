"use client";

import { BackLink } from "@/components/back-link";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertIcon, EmptyIcon } from "@/components/ui/icons";
import { StatusPanel } from "@/components/ui/status-panel";
import { CharacterCollectionSection } from "@/features/characters/components/character-collection-section";
import { EpisodeCollectionSection } from "@/features/episodes/components/episode-collection-section";
import { useLocationDetail } from "../hooks/use-location-detail";

interface LocationDetailViewProps {
  id: string;
}

export function LocationDetailView({ id }: LocationDetailViewProps) {
  const { location, loading, notFound, refetch } = useLocationDetail(id);

  if (!location) {
    if (loading) return <DetailSkeleton />;
    if (notFound) return <NotFoundState />;
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <BackLink label="Back to locations" />

      <Card className="overflow-hidden">
        <div className="space-y-4 p-6 sm:p-8">
          <h2 className="text-display font-bold text-foreground">
            {location.name}
          </h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body">
            <Attribute label="Type" value={location.type} />
            <Attribute label="Dimension" value={location.dimension} />
          </dl>
        </div>
      </Card>

      <CharacterCollectionSection
        title="Residents"
        headingId="location-residents-title"
        characters={location.residents}
        stillLoading={loading}
        loadingLabel="Loading residents…"
        emptyLabel="No residents on record."
        itemNoun="resident"
      />

      {location.dimension !== "Unknown" && (
        <Link
          href={`/characters?dimension=${encodeURIComponent(location.dimension)}`}
          className="inline-flex rounded-control border border-border px-4 py-2 text-body font-medium text-foreground hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          Browse characters in this dimension
        </Link>
      )}

      <section aria-labelledby="location-related-episodes-title">
        <h3
          id="location-related-episodes-title"
          className="mb-4 text-heading font-semibold text-foreground"
        >
          Episodes featuring residents
        </h3>
        <EpisodeCollectionSection
          episodes={location.episodesFeaturingResidents}
        />
      </section>
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-foreground-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-4 w-32 animate-pulse rounded bg-foreground-muted/20" />
      <Card className="overflow-hidden">
        <div className="space-y-4 p-6 sm:p-8">
          <div className="h-8 w-2/3 animate-pulse rounded bg-foreground-muted/20" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded bg-foreground-muted/20"
              />
            ))}
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-card bg-foreground-muted/20"
          />
        ))}
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="space-y-6">
      <BackLink label="Back to locations" />
      <StatusPanel
        tone="brand"
        icon={<EmptyIcon className="h-6 w-6" />}
        heading="Location not found."
        description="Check the link or return to the location list."
      />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <BackLink label="Back to locations" />
      <StatusPanel
        tone="danger"
        icon={<AlertIcon className="h-6 w-6" />}
        heading="Could not load this location."
        description="Check your connection and try again."
        action={<Button onClick={onRetry}>Retry</Button>}
      />
    </div>
  );
}
