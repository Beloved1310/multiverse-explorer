"use client";

import { useQuery } from "@apollo/client/react";
import { graphql } from "@/lib/graphql/generated";

const GetCharacterNames = graphql(`
  query GetCharacterNames {
    characters {
      results {
        id
        name
      }
    }
  }
`);

export default function Home() {
  const { data, loading, error } = useQuery(GetCharacterNames);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Multiverse Explorer</h1>
      {loading && <p>Loading characters…</p>}
      {error && <p role="alert">Failed to load characters.</p>}
      {data && (
        <ul className="list-disc">
          {data.characters?.results?.map((character) => (
            <li key={character?.id}>{character?.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
