import { execSync } from "node:child_process";
import { join } from "node:path";

// ストーリーの確認は、毎回 seed で作り直した同じ世界から始める
export default function globalSetup() {
  execSync("bun run db:seed", { cwd: join(import.meta.dirname, "../../.."), stdio: "inherit" });
}
