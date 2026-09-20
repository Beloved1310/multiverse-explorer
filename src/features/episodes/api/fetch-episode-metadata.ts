import { UNKNOWN_VALUE } from "@/lib/normalize-text";
import { getConnectedDataset } from "@/server/data/loader";

interface EpisodeMetadata {
  name: string;
  code: string;
}

/** Reads the BFF cache so page metadata and the screen use one data source. */
export async function fetchEpisodeMetadata(
  id: string,
): Promise<EpisodeMetadata | null> {
  try {
    const dataset = await getConnectedDataset();
    const episode = dataset.episodes.find((item) => item.id === id);
    if (!episode) return null;

    return { name: episode.name, code: episode.code || UNKNOWN_VALUE };
  } catch {
    return null;
  }
}
