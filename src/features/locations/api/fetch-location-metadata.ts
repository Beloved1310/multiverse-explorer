import { UNKNOWN_VALUE } from "@/lib/normalize-text";
import { getConnectedDataset } from "@/server/data/loader";

interface LocationMetadata {
  name: string;
  type: string;
}

/** Reads the BFF cache so page metadata and the screen use one data source. */
export async function fetchLocationMetadata(
  id: string,
): Promise<LocationMetadata | null> {
  try {
    const dataset = await getConnectedDataset();
    const location = dataset.locations.find((item) => item.id === id);
    if (!location) return null;

    return { name: location.name, type: location.type || UNKNOWN_VALUE };
  } catch {
    return null;
  }
}
