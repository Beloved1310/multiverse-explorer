import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EpisodeBrowser } from "@/features/episodes/components/episode-browser";

export const metadata: Metadata = {
  title: "Episodes | Multiverse Explorer",
  description:
    "Search and filter every episode across the Rick and Morty multiverse.",
};

const SKELETON_COUNT = 9;

function BrowserFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonCard key={index} variant="banner" />
      ))}
    </div>
  );
}

export default function EpisodesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <Suspense fallback={<BrowserFallback />}>
          <EpisodeBrowser />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
