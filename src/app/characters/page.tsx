import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { CharacterBrowser } from "@/features/characters/components/character-browser";

export const metadata: Metadata = {
  title: "Characters | Multiverse Explorer",
  description:
    "Search and filter every character across the Rick and Morty multiverse.",
};

const SKELETON_COUNT = 9;

function BrowserFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export default function CharactersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <Suspense fallback={<BrowserFallback />}>
          <CharacterBrowser />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
