import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";
const batchSize = 100;

async function query(queryText, variables) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: queryText, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length)
    throw new Error("Unable to create snapshot.");
  return payload.data;
}

const chunk = (values) =>
  Array.from({ length: Math.ceil(values.length / batchSize) }, (_, index) =>
    values.slice(index * batchSize, (index + 1) * batchSize),
  );
const ids = (count) =>
  Array.from({ length: count }, (_, index) => String(index + 1));

const counts = await query(
  `query { characters { info { count } } locations { info { count } } episodes { info { count } } }`,
);
const [characters, locations, episodes] = await Promise.all([
  Promise.all(
    chunk(ids(counts.characters.info.count)).map((ids) =>
      query(
        `query($ids:[ID!]!){charactersByIds(ids:$ids){id name image status species gender origin{id} location{id} episode{id}}}`,
        { ids },
      ),
    ),
  ).then((pages) =>
    pages
      .flatMap((page) => page.charactersByIds)
      .filter(Boolean)
      .map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        status: item.status,
        species: item.species,
        gender: item.gender,
        originId: item.origin?.id ?? null,
        locationId: item.location?.id ?? null,
        episodeIds: item.episode.filter(Boolean).map((episode) => episode.id),
      })),
  ),
  Promise.all(
    chunk(ids(counts.locations.info.count)).map((ids) =>
      query(
        `query($ids:[ID!]!){locationsByIds(ids:$ids){id name type dimension residents{id}}}`,
        { ids },
      ),
    ),
  ).then((pages) =>
    pages
      .flatMap((page) => page.locationsByIds)
      .filter(Boolean)
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        dimension: item.dimension,
        residentIds: item.residents
          .filter(Boolean)
          .map((resident) => resident.id),
      })),
  ),
  Promise.all(
    chunk(ids(counts.episodes.info.count)).map((ids) =>
      query(
        `query($ids:[ID!]!){episodesByIds(ids:$ids){id name episode air_date characters{id}}}`,
        { ids },
      ),
    ),
  ).then((pages) =>
    pages
      .flatMap((page) => page.episodesByIds)
      .filter(Boolean)
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.episode,
        airDate: item.air_date,
        characterIds: item.characters
          .filter(Boolean)
          .map((character) => character.id),
      })),
  ),
]);

const path = resolve("src/server/data/snapshot.json");
await writeFile(
  path,
  `${JSON.stringify({ characters, locations, episodes }, null, 2)}\n`,
);
console.log(
  `Saved ${characters.length} characters, ${locations.length} locations, and ${episodes.length} episodes to ${path}.`,
);
