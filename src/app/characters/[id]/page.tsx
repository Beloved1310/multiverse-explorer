import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { fetchCharacterMetadata } from "@/features/characters/api/fetch-character-metadata";
import { CharacterDetailView } from "@/features/characters/components/character-detail-view";

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]">): Promise<Metadata> {
  const { id } = await params;
  const character = await fetchCharacterMetadata(id);

  if (!character) {
    return {
      title: "Character not found | Multiverse Explorer",
      description:
        "This character could not be found in the multiverse archive.",
    };
  }

  return {
    title: `${character.name} | Multiverse Explorer`,
    description: `${character.name} -- status: ${character.status}, species: ${character.species}. See their full profile and episode appearances on Multiverse Explorer.`,
  };
}

export default async function CharacterDetailPage({
  params,
}: PageProps<"/characters/[id]">) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <CharacterDetailView id={id} />
      </ErrorBoundary>
    </main>
  );
}
