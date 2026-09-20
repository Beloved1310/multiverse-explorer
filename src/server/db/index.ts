import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDatabase = globalThis as unknown as {
  multiverseDatabasePool?: Pool;
};

const pool =
  globalForDatabase.multiverseDatabasePool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.multiverseDatabasePool = pool;
}

export const db = drizzle({ client: pool, schema });
