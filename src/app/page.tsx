import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { CharacterBrowser } from "@/features/characters/components/character-browser";

const SKELETON_COUNT = 8;

function BrowserFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export default function Home() {
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
