"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SpinnerIcon } from "@/components/ui/icons";
import { formatNumber } from "@/lib/format";
import { pluralize } from "@/lib/pluralize";
import type { Character } from "../domain/character";
import { CharacterCard } from "./character-card";

const PAGE_SIZE = 12;

interface CharacterCollectionSectionProps {
  title: string;
  headingId: string;
  characters: Character[];
  /** True while the rest of the detail query (this list included) is still in flight. */
  stillLoading: boolean;
  loadingLabel: string;
  emptyLabel: string;
  /** Singular noun for the "Showing X of Y {noun}" caption, e.g. "resident". */
  itemNoun: string;
}

/**
 * Shared by the location-detail "Residents" section and the
 * episode-detail "Characters in this episode" section -- both render a
 * `Character[]` fetched in full by the API (no server-side pagination is
 * available on either nested field; verified via introspection), so
 * rendering is capped and revealed progressively here instead, rather
 * than putting a potentially large number of cards in the DOM at once.
 */
export function CharacterCollectionSection({
  title,
  headingId,
  characters,
  stillLoading,
  loadingLabel,
  emptyLabel,
  itemNoun,
}: CharacterCollectionSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = characters.slice(0, visibleCount);
  const hasMore = visibleCount < characters.length;

  return (
    <section aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="mb-4 text-heading font-semibold text-foreground"
      >
        {title}
      </h3>

      {characters.length === 0 && stillLoading && (
        <p className="flex items-center gap-2 text-caption text-foreground-muted">
          <SpinnerIcon className="h-4 w-4 text-brand" />
          {loadingLabel}
        </p>
      )}

      {characters.length === 0 && !stillLoading && (
        <p className="text-caption text-foreground-muted">{emptyLabel}</p>
      )}

      {characters.length > 0 && (
        <>
          <p className="mb-4 text-caption text-foreground-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {formatNumber(visible.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {formatNumber(characters.length)}
            </span>{" "}
            {pluralize(itemNoun, characters.length)}
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>

          {hasMore && (
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
      )}
    </section>
  );
}
