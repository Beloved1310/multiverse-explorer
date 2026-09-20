import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPinIcon, SparkleIcon, FilmIcon } from "@/components/ui/icons";
import { pluralize } from "@/lib/pluralize";
import { HighlightedText } from "@/components/ui/highlighted-text";
import {
  STATUS_LABELS,
  type Character,
  type CharacterStatus,
} from "../domain/character";

const STATUS_ACCENT: Record<CharacterStatus, string> = {
  alive: "bg-status-alive-fg",
  dead: "bg-status-dead-fg",
  unknown: "bg-status-unknown-fg",
};

interface CharacterCardProps {
  character: Character;
  /** Only the first image in an above-the-fold collection should be eager. */
  eagerImage?: boolean;
  searchTerm?: string;
}

export function CharacterCard({
  character,
  eagerImage = false,
  searchTerm,
}: CharacterCardProps) {
  return (
    <Link
      href={`/characters/${character.id}`}
      aria-label={`View ${character.name}, ${STATUS_LABELS[character.status]}, ${character.episodes.length} ${pluralize("episode", character.episodes.length)}`}
      className="group block rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card className="h-full overflow-hidden transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-brand/40 group-hover:shadow-xl group-hover:shadow-brand/10 motion-reduce:transition-none">
        <div
          aria-hidden="true"
          className={`h-1 w-full ${STATUS_ACCENT[character.status]}`}
        />
        <div className="relative aspect-[5/4] w-full bg-surface-elevated">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={`Portrait of ${character.name}`}
              fill
              loading={eagerImage ? "eager" : "lazy"}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-caption text-foreground-muted"
            >
              No image
            </div>
          )}

          {/* Gradient scrim: dark and opaque enough at the text baseline
              that the overlaid name stays readable regardless of what's
              in the underlying photo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 via-black/40 to-transparent"
          />
          <h3 className="absolute inset-x-0 bottom-0 truncate p-3 text-body font-semibold text-white">
            <HighlightedText text={character.name} query={searchTerm} />
          </h3>

          <Badge
            tone={character.status}
            className="absolute top-2 right-2 backdrop-blur-sm"
          >
            {STATUS_LABELS[character.status]}
          </Badge>
        </div>

        <div className="space-y-2 p-3">
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="min-w-0 truncate">{character.species}</span>
          </p>
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="min-w-0 truncate">{character.location}</span>
          </p>
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <FilmIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            {character.episodes.length}{" "}
            {pluralize("episode", character.episodes.length)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
