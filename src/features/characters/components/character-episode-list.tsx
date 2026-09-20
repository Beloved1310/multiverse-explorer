"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  CalendarIcon,
  ChevronRightIcon,
  SpinnerIcon,
} from "@/components/ui/icons";
import { seasonKey, seasonLabel } from "@/lib/group-episodes-by-season";
import { pluralize } from "@/lib/pluralize";
import type {
  CharacterEpisode,
  CharacterEpisodeSeasonSummary,
} from "../domain/character-detail";
import { useCharacterEpisodesInSeason } from "../hooks/use-character-episodes-in-season";

interface CharacterEpisodeListProps {
  characterId: string;
  episodeCount: number;
  episodeSeasons: CharacterEpisodeSeasonSummary[];
}

export function CharacterEpisodeList({
  characterId,
  episodeCount,
  episodeSeasons,
}: CharacterEpisodeListProps) {
  const groupSignature = episodeSeasons
    .map(({ season }) => seasonKey(season))
    .join("|");
  const initialGroup = episodeSeasons[0]
    ? seasonKey(episodeSeasons[0].season)
    : undefined;
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() =>
    initialGroup ? new Set([initialGroup]) : new Set(),
  );
  const previousGroupSignature = useRef(groupSignature);
  const idPrefix = useId();

  // A cache-only render (e.g. arriving from the character list, before the
  // full detail query resolves) can briefly report a different season set
  // than the one that eventually loads. Give the newly-arrived list the
  // promised default state (its first season open) without changing
  // user-controlled state while that list remains the same.
  useEffect(() => {
    if (previousGroupSignature.current === groupSignature) return;
    previousGroupSignature.current = groupSignature;
    setExpandedGroups(initialGroup ? new Set([initialGroup]) : new Set());
  }, [groupSignature, initialGroup]);

  const hasMultipleGroups = episodeSeasons.length > 1;
  const seasonCount = episodeSeasons.length;

  return (
    <section aria-labelledby={`${idPrefix}-title`} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h3
            id={`${idPrefix}-title`}
            className="text-heading font-semibold text-foreground"
          >
            Episode appearances
          </h3>
          <p className="text-caption text-foreground-muted">
            Appears in {episodeCount} {pluralize("episode", episodeCount)}{" "}
            across {seasonCount} {pluralize("season", seasonCount)}
          </p>
        </div>

        {hasMultipleGroups && (
          <div
            className="flex items-center gap-2"
            aria-label="Episode sections"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedGroups(
                  new Set(
                    episodeSeasons.map(({ season }) => seasonKey(season)),
                  ),
                )
              }
              className="rounded-control px-2 py-1 text-caption font-medium text-brand hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setExpandedGroups(new Set())}
              className="rounded-control px-2 py-1 text-caption font-medium text-brand hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-border rounded-control border border-border">
        {episodeSeasons.map(({ season, count }) => {
          const key = seasonKey(season);
          const isExpanded = expandedGroups.has(key);
          const buttonId = `${idPrefix}-${key}-button`;
          const panelId = `${idPrefix}-${key}-panel`;

          if (!hasMultipleGroups) {
            return (
              <div key={key} className="p-4 sm:p-5">
                <GroupHeading label={seasonLabel(season)} count={count} />
                <SeasonEpisodePanel
                  characterId={characterId}
                  season={season}
                  isExpanded
                />
              </div>
            );
          }

          return (
            <div key={key}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => {
                  setExpandedGroups((current) => {
                    const next = new Set(current);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                  });
                }}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:ring-inset sm:px-5"
              >
                <GroupHeading label={seasonLabel(season)} count={count} />
                <span aria-hidden="true" className="text-caption text-brand">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isExpanded}
                className="px-4 pb-4 sm:px-5 sm:pb-5"
              >
                <SeasonEpisodePanel
                  characterId={characterId}
                  season={season}
                  isExpanded={isExpanded}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function GroupHeading({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-body font-semibold text-foreground">{label}</span>
      <span className="text-caption text-foreground-muted">
        {count} {pluralize("episode", count)}
      </span>
    </span>
  );
}

interface SeasonEpisodePanelProps {
  characterId: string;
  season: number | null;
  isExpanded: boolean;
}

/**
 * One season's episode rows, fetched paginated from the backend the first
 * time its accordion panel opens. `hasLoadedOnce` is sticky -- once a
 * season has been expanded, its query (and Apollo's cache of the result)
 * stays alive even after the panel collapses again, matched by the
 * caller wrapping this in a `hidden` div rather than unmounting it. That
 * way re-expanding a season already seen is instant, with no refetch or
 * loading flicker, exactly like before this had any network cost.
 */
function SeasonEpisodePanel({
  characterId,
  season,
  isExpanded,
}: SeasonEpisodePanelProps) {
  // React's supported "adjust state while rendering" pattern (see
  // react.dev/learn/you-might-not-need-an-effect): setting state here,
  // guarded so it only fires on an actual change, updates before this
  // render paints -- no extra effect-triggered render, and no ref access
  // during render either.
  const [hasLoadedOnce, setHasLoadedOnce] = useState(isExpanded);
  const [previousIsExpanded, setPreviousIsExpanded] = useState(isExpanded);
  if (isExpanded !== previousIsExpanded) {
    setPreviousIsExpanded(isExpanded);
    if (isExpanded) setHasLoadedOnce(true);
  }

  const {
    episodes,
    loading,
    error,
    page,
    totalPages,
    hasPrevPage,
    hasNextPage,
    goToPrevPage,
    goToNextPage,
    refetch,
  } = useCharacterEpisodesInSeason(characterId, season, hasLoadedOnce);

  if (!hasLoadedOnce) return null;

  if (error && episodes.length === 0) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-surface-elevated px-3 py-2.5">
        <span className="flex items-center gap-2 text-caption text-foreground-muted">
          <AlertIcon className="h-4 w-4 text-status-dead-fg" />
          Could not load these episodes.
        </span>
        <Button variant="secondary" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="mt-3 flex items-center gap-2 text-caption text-foreground-muted">
        <SpinnerIcon className="h-4 w-4 text-brand" />
        Loading episodes&hellip;
      </p>
    );
  }

  return (
    <>
      <EpisodeRows episodes={episodes} />
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-caption text-foreground-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            {hasPrevPage && (
              <button
                type="button"
                onClick={goToPrevPage}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-control text-brand hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                <ChevronRightIcon className="h-4 w-4 rotate-180" />
              </button>
            )}
            {hasNextPage && (
              <button
                type="button"
                onClick={goToNextPage}
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-control text-brand hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function EpisodeRows({ episodes }: { episodes: CharacterEpisode[] }) {
  return (
    <ul className="mt-3 divide-y divide-border">
      {episodes.map((episode, index) => (
        <li
          key={episode.id || `${episode.code}-${index}`}
          className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-control bg-brand-subtle px-2 py-1 text-caption font-semibold text-brand">
              {episode.code}
            </span>
            <span className="text-body text-foreground">{episode.name}</span>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-caption text-foreground-muted">
            <CalendarIcon className="h-3.5 w-3.5" />
            {episode.airDate}
          </span>
        </li>
      ))}
    </ul>
  );
}
