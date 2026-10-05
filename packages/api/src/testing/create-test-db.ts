import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createDb } from "@auto-friend/db";
import { migrate } from "drizzle-orm/libsql/migrator";

const MIGRATIONS_FOLDER = join(import.meta.dir, "../../../db/src/migrations");

// テストごとに一時ファイルのSQLiteを作り、マイグレーションを当てる。
export async function createTestDb() {
  const dir = mkdtempSync(join(tmpdir(), "auto-friend-test-"));
  const db = createDb({ DATABASE_URL: `file:${join(dir, "test.db")}` });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return db;
}
