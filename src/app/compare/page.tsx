import { Suspense } from "react";
import { CharacterComparison } from "@/features/characters/components/character-comparison";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-8 text-body text-foreground-muted sm:px-6 lg:px-8">
          Loading comparison…
        </main>
      }
    >
      <CharacterComparison />
    </Suspense>
  );
}
