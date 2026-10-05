import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  const client = createClient({
    url: env.DATABASE_URL,
  });

  return drizzle({ client, relations });
}

export type Database = ReturnType<typeof createDb>;

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

// トランザクションの内外どちらからでも呼べる関数の引数に使う
export type DbExecutor = Database | Transaction;
