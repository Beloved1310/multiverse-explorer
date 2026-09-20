import "server-only";

import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  savedCharacterFilters,
  type SavedCharacterFilterData,
} from "@/server/db/schema";

const MAX_SAVED_FILTERS = 30;
const MAX_TEXT_LENGTH = 120;
const MAX_NAME_LENGTH = 80;
const STATUS_OPTIONS = new Set(["alive", "dead", "unknown"]);
const GENDER_OPTIONS = new Set(["male", "female", "genderless", "unknown"]);

export interface SavedFilterInput {
  name: string;
  filter: {
    name?: string | null;
    statuses?: string[] | null;
    species?: string | null;
    gender?: string | null;
    dimension?: string | null;
    minEpisodes?: number | null;
    sort?: {
      field?: "NAME" | "EPISODE_COUNT" | null;
      direction?: "ASC" | "DESC" | null;
    } | null;
  };
}

export class SavedFilterValidationError extends Error {}
export class SavedFilterLimitError extends Error {}

function text(value: string | null | undefined, label: string): string {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length > MAX_TEXT_LENGTH) {
    throw new SavedFilterValidationError(`${label} is too long.`);
  }
  return trimmed;
}

export function normaliseSavedFilter(input: SavedFilterInput): {
  name: string;
  filter: SavedCharacterFilterData;
} {
  const name = input.name.trim();
  if (!name)
    throw new SavedFilterValidationError("A saved search needs a name.");
  if (name.length > MAX_NAME_LENGTH) {
    throw new SavedFilterValidationError(
      "A saved search name can be at most 80 characters.",
    );
  }

  const statuses = [
    ...new Set(
      (input.filter.statuses ?? []).map((status) =>
        status.trim().toLowerCase(),
      ),
    ),
  ];
  if (statuses.some((status) => !STATUS_OPTIONS.has(status))) {
    throw new SavedFilterValidationError(
      "A saved search contains an invalid status.",
    );
  }

  const gender = text(input.filter.gender, "Gender").toLowerCase();
  if (gender && !GENDER_OPTIONS.has(gender)) {
    throw new SavedFilterValidationError(
      "A saved search contains an invalid gender.",
    );
  }

  const minEpisodes = input.filter.minEpisodes ?? null;
  if (
    minEpisodes !== null &&
    (!Number.isInteger(minEpisodes) || minEpisodes < 0 || minEpisodes > 1000)
  ) {
    throw new SavedFilterValidationError(
      "Minimum episodes must be a whole number from 0 to 1000.",
    );
  }

  const sort = {
    field: input.filter.sort?.field ?? "NAME",
    direction: input.filter.sort?.direction ?? "ASC",
  } as SavedCharacterFilterData["sort"];
  if (
    !["NAME", "EPISODE_COUNT"].includes(sort.field) ||
    !["ASC", "DESC"].includes(sort.direction)
  ) {
    throw new SavedFilterValidationError(
      "A saved search contains an invalid sort.",
    );
  }

  const filter = {
    name: text(input.filter.name, "Character name"),
    statuses,
    species: text(input.filter.species, "Species"),
    gender,
    dimension: text(input.filter.dimension, "Dimension"),
    minEpisodes,
    sort,
  };
  if (
    !filter.name &&
    filter.statuses.length === 0 &&
    !filter.species &&
    !filter.gender &&
    !filter.dimension &&
    filter.minEpisodes === null
  ) {
    throw new SavedFilterValidationError(
      "Choose at least one filter before saving a search.",
    );
  }

  return { name, filter };
}

function toSavedFilter(record: typeof savedCharacterFilters.$inferSelect) {
  return {
    id: record.id,
    name: record.name,
    filter: record.filter,
  };
}

export async function listSavedFilters(userId: string) {
  const records = await db
    .select()
    .from(savedCharacterFilters)
    .where(eq(savedCharacterFilters.userId, userId))
    .orderBy(
      desc(savedCharacterFilters.updatedAt),
      asc(savedCharacterFilters.name),
    );
  return records.map(toSavedFilter);
}

async function ensureCapacity(userId: string, additional = 1) {
  const [result] = await db
    .select({ value: count() })
    .from(savedCharacterFilters)
    .where(eq(savedCharacterFilters.userId, userId));
  if ((result?.value ?? 0) + additional > MAX_SAVED_FILTERS) {
    throw new SavedFilterLimitError(
      `You can save up to ${MAX_SAVED_FILTERS} searches.`,
    );
  }
}

export async function createSavedFilter(
  userId: string,
  input: SavedFilterInput,
) {
  const value = normaliseSavedFilter(input);
  await ensureCapacity(userId);
  try {
    const [record] = await db
      .insert(savedCharacterFilters)
      .values({
        id: crypto.randomUUID(),
        userId,
        name: value.name,
        filter: value.filter,
      })
      .returning();
    if (!record) throw new Error("Saved search was not created.");
    return toSavedFilter(record);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new SavedFilterValidationError(
        "You already have a saved search with that name.",
      );
    }
    throw error;
  }
}

export async function deleteSavedFilter(userId: string, id: string) {
  const [deleted] = await db
    .delete(savedCharacterFilters)
    .where(
      and(
        eq(savedCharacterFilters.id, id),
        eq(savedCharacterFilters.userId, userId),
      ),
    )
    .returning({ id: savedCharacterFilters.id });
  return Boolean(deleted);
}

export async function importSavedFilters(
  userId: string,
  inputs: SavedFilterInput[],
) {
  if (!inputs.length) return listSavedFilters(userId);
  const values = inputs.map(normaliseSavedFilter);
  const names = values.map((value) => value.name);
  if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
    throw new SavedFilterValidationError(
      "Imported saved search names must be unique.",
    );
  }
  const existing = await db
    .select({ name: savedCharacterFilters.name })
    .from(savedCharacterFilters)
    .where(
      and(
        eq(savedCharacterFilters.userId, userId),
        inArray(savedCharacterFilters.name, names),
      ),
    );
  const existingNames = new Set(existing.map((item) => item.name));
  const toInsert = values.filter((value) => !existingNames.has(value.name));
  await ensureCapacity(userId, toInsert.length);
  if (!toInsert.length) return listSavedFilters(userId);

  await db.insert(savedCharacterFilters).values(
    toInsert.map((value) => ({
      id: crypto.randomUUID(),
      userId,
      name: value.name,
      filter: value.filter,
    })),
  );
  return listSavedFilters(userId);
}
