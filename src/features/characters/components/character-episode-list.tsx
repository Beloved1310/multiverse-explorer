"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarIcon } from "@/components/ui/icons";
import { pluralize } from "@/lib/pluralize";
import type { CharacterEpisode } from "../domain/character-detail";
import { groupCharacterEpisodesBySeason } from "../domain/group-character-episodes";

interface CharacterEpisodeListProps {
  episodes: CharacterEpisode[];
}

export function CharacterEpisodeList({ episodes }: CharacterEpisodeListProps) {
  const groups = useMemo(
    () => groupCharacterEpisodesBySeason(episodes),
    [episodes],
  );
  const groupSignature = groups.map((group) => group.key).join("|");
  const initialGroup = groups[0]?.key;
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() =>
    initialGroup ? new Set([initialGroup]) : new Set(),
  );
  const previousGroupSignature = useRef(groupSignature);
  const idPrefix = useId();

  // Detail queries can first render an id-less cache result and then receive
  // the full episode list. Give the newly-arrived list the promised default
  // state (its first season open) without changing user-controlled state
  // while that list remains the same.
  useEffect(() => {
    if (previousGroupSignature.current === groupSignature) return;
    previousGroupSignature.current = groupSignature;
    setExpandedGroups(initialGroup ? new Set([initialGroup]) : new Set());
  }, [groupSignature, initialGroup]);

  const hasMultipleGroups = groups.length > 1;
  const seasonCount = groups.length;

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
            Appears in {episodes.length} {pluralize("episode", episodes.length)}{" "}
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
                setExpandedGroups(new Set(groups.map(({ key }) => key)))
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
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.key);
          const buttonId = `${idPrefix}-${group.key}-button`;
          const panelId = `${idPrefix}-${group.key}-panel`;
          const episodeCount = group.episodes.length;

          if (!hasMultipleGroups) {
            return (
              <div key={group.key} className="p-4 sm:p-5">
                <GroupHeading label={group.label} count={episodeCount} />
                <EpisodeRows episodes={group.episodes} />
              </div>
            );
          }

          return (
            <div key={group.key}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => {
                  setExpandedGroups((current) => {
                    const next = new Set(current);
                    if (next.has(group.key)) next.delete(group.key);
                    else next.add(group.key);
                    return next;
                  });
                }}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:ring-inset sm:px-5"
              >
                <GroupHeading label={group.label} count={episodeCount} />
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
                <EpisodeRows episodes={group.episodes} />
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
