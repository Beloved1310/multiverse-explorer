"use client";

import { SkeletonCard } from "@/components/ui/skeleton-card";
import { CharacterCard } from "@/features/characters/components/character-card";
import { useCharacters } from "@/features/characters/hooks/use-characters";

const SKELETON_COUNT = 8;

export default function Home() {
  const { characters, loading, error } = useCharacters();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p role="status" aria-live="polite" className="sr-only">
        {loading
          ? "Loading characters"
          : error
            ? "Failed to load characters"
            : `${characters.length} characters loaded`}
      </p>

      {error ? (
        <p className="text-body text-status-dead-fg">
          Something went wrong loading characters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : characters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
        </div>
      )}
    </main>
  );
}
