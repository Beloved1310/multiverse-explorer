import { UNKNOWN_VALUE } from "@/lib/normalize-text";
import { getConnectedDataset } from "@/server/data/loader";

interface CharacterMetadata {
  name: string;
  status: string;
  species: string;
}

/** Reads the BFF cache so page metadata and the screen use one data source. */
export async function fetchCharacterMetadata(
  id: string,
): Promise<CharacterMetadata | null> {
  try {
    const dataset = await getConnectedDataset();
    const character = dataset.characters.find((item) => item.id === id);
    if (!character) return null;

    return {
      name: character.name,
      status: character.status || UNKNOWN_VALUE,
      species: character.species || UNKNOWN_VALUE,
    };
  } catch {
    return null;
  }
}
