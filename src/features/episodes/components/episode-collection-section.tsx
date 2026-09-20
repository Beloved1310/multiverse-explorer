"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Episode } from "../domain/episode";
import { EpisodeCard } from "./episode-card";

const PAGE_SIZE = 12;

interface EpisodeCollectionSectionProps {
  episodes: Episode[];
}

export function EpisodeCollectionSection({
  episodes,
}: EpisodeCollectionSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = episodes.slice(0, visibleCount);

  if (episodes.length === 0) {
    return (
      <p className="text-caption text-foreground-muted">
        No appearances on record.
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-caption text-foreground-muted">
        {formatNumber(episodes.length)} episode
        {episodes.length === 1 ? "" : "s"} featuring a resident
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
      {visibleCount < episodes.length && (
        <div className="flex justify-center pt-6">
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Show more
          </Button>
        </div>
      )}
    </>
  );
}
