// 世界を作り直す seed コマンド。
//   bun run db:seed                 サクラ300体と、デモユーザー2人を作る
//   bun run db:seed -- --count 500  サクラの数を変える
//   bun run db:seed -- --no-demo    デモユーザーを作らない
//   bun run db:seed -- --seed 42    乱数のシードを変える
// 既存のエージェント・関係・出来事はすべて消える。ログインユーザー自体は残るので、エージェントを作り直せばよい。
import "varlock/auto-load";

import { createDb } from "../index";
import { ENV } from "../env";
import { agent } from "../schema/agent";
import { relationship } from "../schema/relationship";
import { worldClock } from "../schema/world-clock";
import { createDemoUsers } from "./create-demo-users";
import { createSeedRng } from "./create-seed-rng";
import { generateInitialRelationships } from "./generate-initial-relationships";
import { generateSakuraAgents } from "./generate-sakura-agents";

const INITIAL_DAY = 3;

function readOption(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const count = Number(readOption("count") ?? 300);
const seed = Number(readOption("seed") ?? 20261005);
const withDemo = !process.argv.includes("--no-demo");

const db = createDb(ENV);
const rng = createSeedRng(seed);

await db.delete(agent);
await db.delete(worldClock);
await db.insert(worldClock).values({ currentDay: INITIAL_DAY });

const sakura = await db.transaction(async (tx) => {
  const rows = generateSakuraAgents(rng, count, new Date());
  const inserted: Array<typeof agent.$inferSelect> = [];
  for (let i = 0; i < rows.length; i += 50) {
    inserted.push(
      ...(await tx
        .insert(agent)
        .values(rows.slice(i, i + 50))
        .returning()),
    );
  }
  return inserted;
});

const relationships = generateInitialRelationships(rng, sakura);
if (withDemo) await createDemoUsers(db, rng, sakura, relationships);

const rows = [...relationships.values()];
await db.transaction(async (tx) => {
  for (let i = 0; i < rows.length; i += 100) {
    await tx
      .insert(relationship)
      .values(rows.slice(i, i + 100))
      .onConflictDoNothing();
  }
});

const couples = rows.filter((r) => r.state === "dating" || r.state === "partner").length / 2;
console.log(
  `seeded: day=${INITIAL_DAY} sakura=${sakura.length} relationships=${rows.length} couples=${couples}`,
);
if (withDemo)
  console.log(
    "demo users: demo@auto-friend.test / couple@auto-friend.test (password: demo-password)",
  );
