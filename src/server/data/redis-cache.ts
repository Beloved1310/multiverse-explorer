import "server-only";

import { createClient } from "redis";
import { logError } from "@/lib/logger";
import type { ConnectedDataset } from "./types";

const DATASET_KEY = "multiverse-explorer:dataset:v1";
const DATASET_TTL_SECONDS = 60 * 60 * 24;

interface RedisReadClient {
  connect(): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  on(event: "error", listener: (error: Error) => void): unknown;
}

let clientPromise: Promise<RedisReadClient | null> | undefined;

async function getClient() {
  if (!process.env.REDIS_URL) return null;
  clientPromise ??= (async () => {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => logError("redis_client_error", {}, error));
    try {
      await client.connect();
      return client;
    } catch (error) {
      logError("redis_connect_failed", {}, error);
      return null;
    }
  })();
  return clientPromise;
}

export async function readSharedDataset(): Promise<ConnectedDataset | null> {
  try {
    const client = await getClient();
    const value = client ? await client.get(DATASET_KEY) : null;
    return value ? (JSON.parse(value) as ConnectedDataset) : null;
  } catch (error) {
    logError("redis_read_failed", { key: DATASET_KEY }, error);
    return null;
  }
}

export async function writeSharedDataset(dataset: ConnectedDataset) {
  try {
    const client = await getClient();
    if (client)
      await client.set(DATASET_KEY, JSON.stringify(dataset), {
        EX: DATASET_TTL_SECONDS,
      });
  } catch (error) {
    logError("redis_write_failed", { key: DATASET_KEY }, error);
  }
}
