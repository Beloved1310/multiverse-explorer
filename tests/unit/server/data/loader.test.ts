import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectDataset,
  loadConnectedDataset,
  loadLiveDataset,
} from "@/server/data/loader";
import snapshot from "@/server/data/snapshot.json";
import type { RawDataset } from "@/server/data/types";

function jsonResponse(
  data: unknown,
  init: { ok?: boolean; status?: number } = {},
) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => ({ data }),
  } as Response;
}

function parseBody(init: RequestInit | undefined) {
  return JSON.parse((init?.body as string) ?? "{}") as {
    query: string;
    variables?: { ids?: string[] };
  };
}

describe("loadLiveDataset", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("batches id lookups by 100, resolves relationship ids, and maps every field the app reads", async () => {
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      const { query, variables } = parseBody(init);

      if (query.includes("DatasetCounts")) {
        return jsonResponse({
          characters: { info: { count: 150 } },
          locations: { info: { count: 1 } },
          episodes: { info: { count: 1 } },
        });
      }

      if (query.includes("CharactersByIds")) {
        const ids = variables?.ids ?? [];
        return jsonResponse({
          charactersByIds: ids.map((id) => ({
            id,
            name: `Character ${id}`,
            image: `image-${id}.png`,
            status: "Alive",
            species: "Human",
            gender: "Male",
            origin: { id: "location-1" },
            location: { id: "location-1" },
            episode: [{ id: "episode-1" }, null],
          })),
        });
      }

      if (query.includes("LocationsByIds")) {
        return jsonResponse({
          locationsByIds: [
            {
              id: "location-1",
              name: "Earth",
              type: "Planet",
              dimension: "C-137",
              residents: [{ id: "1" }, { id: "2" }],
            },
          ],
        });
      }

      if (query.includes("EpisodesByIds")) {
        return jsonResponse({
          episodesByIds: [
            {
              id: "episode-1",
              name: "Pilot",
              episode: "S01E01",
              air_date: "December 2, 2013",
              characters: [{ id: "1" }],
            },
          ],
        });
      }

      throw new Error(`Unexpected query in test: ${query}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const dataset = await loadLiveDataset();

    expect(dataset.characters).toHaveLength(150);
    expect(dataset.characters[0]).toEqual({
      id: "1",
      name: "Character 1",
      image: "image-1.png",
      status: "Alive",
      species: "Human",
      gender: "Male",
      originId: "location-1",
      locationId: "location-1",
      episodeIds: ["episode-1"],
    });
    expect(dataset.locations).toEqual([
      {
        id: "location-1",
        name: "Earth",
        type: "Planet",
        dimension: "C-137",
        residentIds: ["1", "2"],
      },
    ]);
    expect(dataset.episodes).toEqual([
      {
        id: "episode-1",
        name: "Pilot",
        code: "S01E01",
        airDate: "December 2, 2013",
        characterIds: ["1"],
      },
    ]);

    const characterBatchCalls = fetchMock.mock.calls.filter(([, init]) =>
      parseBody(init as RequestInit).query.includes("CharactersByIds"),
    );
    expect(characterBatchCalls).toHaveLength(2);
    const [firstBatch, secondBatch] = characterBatchCalls;
    expect(
      parseBody(firstBatch?.[1] as RequestInit).variables?.ids,
    ).toHaveLength(100);
    expect(
      parseBody(secondBatch?.[1] as RequestInit).variables?.ids,
    ).toHaveLength(50);
  });

  it("fills in fallback values for entities missing optional fields", async () => {
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      const { query } = parseBody(init);

      if (query.includes("DatasetCounts")) {
        return jsonResponse({
          characters: { info: { count: 1 } },
          locations: { info: { count: 0 } },
          episodes: { info: { count: 0 } },
        });
      }

      if (query.includes("CharactersByIds")) {
        return jsonResponse({
          charactersByIds: [
            {
              id: "1",
              name: null,
              image: null,
              status: null,
              species: null,
              gender: null,
              origin: null,
              location: null,
              episode: null,
            },
          ],
        });
      }

      return jsonResponse({});
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const dataset = await loadLiveDataset();

    expect(dataset.characters).toEqual([
      {
        id: "1",
        name: "Unknown",
        image: "",
        status: "unknown",
        species: "Unknown",
        gender: "unknown",
        originId: null,
        locationId: null,
        episodeIds: [],
      },
    ]);
    expect(dataset.locations).toEqual([]);
    expect(dataset.episodes).toEqual([]);
  });
});

describe("loadConnectedDataset", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("falls back to the bundled snapshot when every live request fails", async () => {
    global.fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const dataset = await loadConnectedDataset();
    const expected = connectDataset(snapshot as RawDataset);

    // loadedAt is set to `new Date().toISOString()` independently in each
    // call, so it's checked for shape, not equality against `expected`.
    expect(dataset.characters).toEqual(expected.characters);
    expect(dataset.locations).toEqual(expected.locations);
    expect(dataset.episodes).toEqual(expected.episodes);
    expect(dataset.loadedAt).toEqual(expect.any(String));

    // A silent, empty fallback would pass the assertions above for the
    // wrong reason. This guards against that, and against snapshot.json
    // ever being checked in empty or truncated.
    expect(dataset.characters.length).toBeGreaterThan(0);
    expect(dataset.locations.length).toBeGreaterThan(0);
    expect(dataset.episodes.length).toBeGreaterThan(0);

    // Logged as one JSON line via logError (src/lib/logger.ts), not a
    // plain console.error(message, error) pair.
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(errorSpy.mock.calls[0]?.[0] as string);
    expect(logged).toMatchObject({
      level: "error",
      event: "dataset_load_failed",
      fallback: "snapshot",
      error: { message: "Failed to fetch" },
    });
  });
});
