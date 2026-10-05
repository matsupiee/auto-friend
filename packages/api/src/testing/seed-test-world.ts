import type { Database } from "@auto-friend/db";
import { agent } from "@auto-friend/db/schema/agent";
import { relationship } from "@auto-friend/db/schema/relationship";
import { worldClock } from "@auto-friend/db/schema/world-clock";
import { createSeedRng } from "@auto-friend/db/seed/create-seed-rng";
import { generateInitialRelationships } from "@auto-friend/db/seed/generate-initial-relationships";
import { generateSakuraAgents } from "@auto-friend/db/seed/generate-sakura-agents";

// テスト用に、サクラエージェントのいる世界を作る。本番の seed と同じ生成ロジックを使う。
export async function seedTestWorld(
  db: Database,
  options: { count?: number; day?: number; seed?: number } = {},
) {
  const rng = createSeedRng(options.seed ?? 1);
  await db.insert(worldClock).values({ currentDay: options.day ?? 3 });
  const rows = generateSakuraAgents(rng, options.count ?? 60, new Date());
  const sakura = await db.insert(agent).values(rows).returning();
  const relationships = [...generateInitialRelationships(rng, sakura).values()];
  for (let i = 0; i < relationships.length; i += 100) {
    await db.insert(relationship).values(relationships.slice(i, i + 100));
  }
  return sakura;
}
