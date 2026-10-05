import type { Database } from "@auto-friend/db";
import { worldClock } from "@auto-friend/db/schema/world-clock";
import { eq } from "drizzle-orm";

import { createRng } from "./create-rng";
import { loadWorld } from "./load-world";
import { saveWorldChanges } from "./save-world-changes";
import { simulateDay } from "./simulate-day";

// 世界を1日進める。本番では Scheduler から呼ぶ想定で、モックでは画面のボタンから呼ぶ。
export async function runWorldDay(db: Database, seed: number = Date.now()) {
  const world = await loadWorld(db);
  const day = world.currentDay + 1;
  const events = simulateDay({
    day,
    agents: world.agents,
    store: world.store,
    rng: createRng(seed),
  });

  await db.transaction(async (tx) => {
    await saveWorldChanges(tx, world.store, events);
    // 同時に2回進められた場合に、同じ日を二重にシミュレーションしないようにする
    const updated = await tx
      .update(worldClock)
      .set({ currentDay: day })
      .where(eq(worldClock.currentDay, world.currentDay))
      .returning();
    if (updated.length === 0) {
      const [clock] = await tx.select().from(worldClock).limit(1);
      if (clock) throw new Error("world clock was advanced concurrently");
      await tx.insert(worldClock).values({ currentDay: day });
    }
  });

  return { day, eventCount: events.length };
}
