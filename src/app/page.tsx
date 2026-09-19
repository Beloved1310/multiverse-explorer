import { ErrorBoundary } from "@/components/ui/error-boundary";
import { CharacterResults } from "@/features/characters/components/character-results";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <CharacterResults />
      </ErrorBoundary>
    </main>
  );
}
