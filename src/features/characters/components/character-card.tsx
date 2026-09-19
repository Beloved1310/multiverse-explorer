import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPinIcon, SparkleIcon } from "@/components/ui/icons";
import type { Character, CharacterStatus } from "../domain/character";

const STATUS_LABEL: Record<CharacterStatus, string> = {
  alive: "Alive",
  dead: "Dead",
  unknown: "Unknown",
};

const STATUS_ACCENT: Record<CharacterStatus, string> = {
  alive: "bg-status-alive-fg",
  dead: "bg-status-dead-fg",
  unknown: "bg-status-unknown-fg",
};

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link
      href={`/characters/${character.id}`}
      className="group block rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card className="overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-lg group-hover:shadow-brand/10">
        <div
          aria-hidden="true"
          className={`h-1 w-full ${STATUS_ACCENT[character.status]}`}
        />
        <div className="relative aspect-square w-full bg-surface-elevated">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={`Portrait of ${character.name}`}
              fill
              loading="lazy"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <h3 className="absolute inset-x-0 bottom-0 truncate p-3 text-heading font-semibold text-white">
            {character.name}
          </h3>

          <Badge
            tone={character.status}
            className="absolute top-2 right-2 backdrop-blur-sm"
          >
            {STATUS_LABEL[character.status]}
          </Badge>
        </div>

        <div className="space-y-1.5 p-3">
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="min-w-0 truncate">{character.species}</span>
          </p>
          <p className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="min-w-0 truncate">{character.location}</span>
          </p>
        </div>
      </Card>
    </Link>
  );
}
