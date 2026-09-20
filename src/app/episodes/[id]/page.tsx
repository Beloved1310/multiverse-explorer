import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { fetchEpisodeMetadata } from "@/features/episodes/api/fetch-episode-metadata";
import { EpisodeDetailView } from "@/features/episodes/components/episode-detail-view";

export async function generateMetadata({
  params,
}: PageProps<"/episodes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const episode = await fetchEpisodeMetadata(id);

  if (!episode) {
    return {
      title: "Episode not found | Multiverse Explorer",
      description: "This episode could not be found in the multiverse archive.",
    };
  }

  return {
    title: `${episode.name} | Multiverse Explorer`,
    description: `${episode.name} (${episode.code}) -- see the full cast of characters on Multiverse Explorer.`,
  };
}

export default async function EpisodeDetailPage({
  params,
}: PageProps<"/episodes/[id]">) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <EpisodeDetailView id={id} />
      </ErrorBoundary>
    </main>
  );
}
