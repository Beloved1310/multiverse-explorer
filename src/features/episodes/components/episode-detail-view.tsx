"use client";

import { BackLink } from "@/components/back-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertIcon, CalendarIcon, EmptyIcon } from "@/components/ui/icons";
import { StatusPanel } from "@/components/ui/status-panel";
import { CharacterCollectionSection } from "@/features/characters/components/character-collection-section";
import { useEpisodeDetail } from "../hooks/use-episode-detail";

interface EpisodeDetailViewProps {
  id: string;
}

export function EpisodeDetailView({ id }: EpisodeDetailViewProps) {
  const { episode, loading, notFound, refetch } = useEpisodeDetail(id);

  if (!episode) {
    if (loading) return <DetailSkeleton />;
    if (notFound) return <NotFoundState />;
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <BackLink label="Back to episodes" />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8">
          <div className="space-y-2">
            <span className="inline-block rounded-control bg-brand-subtle px-2.5 py-1 text-caption font-semibold text-brand">
              {episode.code}
            </span>
            <h2 className="text-display font-bold text-foreground">
              {episode.name}
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <CalendarIcon className="h-4 w-4" />
            {episode.airDate}
          </span>
        </div>
      </Card>

      <CharacterCollectionSection
        title="Characters in this episode"
        headingId="episode-characters-title"
        characters={episode.characters}
        stillLoading={loading}
        loadingLabel="Loading cast…"
        emptyLabel="No character appearances on record."
        itemNoun="character"
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-4 w-32 animate-pulse rounded bg-foreground-muted/20" />
      <Card className="overflow-hidden">
        <div className="space-y-3 p-6 sm:p-8">
          <div className="h-6 w-20 animate-pulse rounded-full bg-foreground-muted/20" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-foreground-muted/20" />
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
      <BackLink label="Back to episodes" />
      <StatusPanel
        tone="brand"
        icon={<EmptyIcon className="h-6 w-6" />}
        heading="This episode doesn't exist in any reality we've found."
        description="Double-check the link, or head back and browse the episode list."
      />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <BackLink label="Back to episodes" />
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
