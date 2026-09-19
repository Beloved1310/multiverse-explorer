import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Character, CharacterStatus } from "../domain/character";

const STATUS_LABEL: Record<CharacterStatus, string> = {
  alive: "Alive",
  dead: "Dead",
  unknown: "Unknown",
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
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square w-full bg-surface-elevated">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={`Portrait of ${character.name}`}
              fill
              loading="lazy"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
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
        <div className="space-y-2 p-4">
          <h3 className="text-heading font-semibold text-foreground">
            {character.name}
          </h3>
          <Badge tone={character.status}>
            {STATUS_LABEL[character.status]}
          </Badge>
          <p className="text-caption text-foreground-muted">
            {character.species}
          </p>
          <p className="text-caption text-foreground-muted">
            {character.location}
          </p>
        </div>
      </Card>
    </Link>
  );
}
