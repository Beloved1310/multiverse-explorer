import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CalendarIcon, UsersIcon } from "@/components/ui/icons";
import { formatNumber } from "@/lib/format";
import { pluralize } from "@/lib/pluralize";
import type { Episode } from "../domain/episode";

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Link
      href={`/episodes/${episode.id}`}
      className="group block rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card className="h-full overflow-hidden transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-brand/40 group-hover:shadow-xl group-hover:shadow-brand/10 motion-reduce:transition-none">
        <div className="flex items-center justify-between gap-2 border-b border-brand/10 bg-brand-subtle px-4 py-3">
          <span className="rounded-control bg-background px-2 py-0.5 text-caption font-semibold text-brand">
            {episode.code}
          </span>
          <span className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <CalendarIcon className="h-3.5 w-3.5" />
            {episode.airDate}
          </span>
        </div>

        <div className="flex min-h-28 flex-col justify-between gap-4 p-4">
          <h3 className="line-clamp-2 text-heading font-semibold text-foreground">
            {episode.name}
          </h3>
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <UsersIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            {formatNumber(episode.characterCount)}{" "}
            {pluralize("character", episode.characterCount)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
