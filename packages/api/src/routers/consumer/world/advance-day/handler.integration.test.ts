import { describe, expect, test } from "bun:test";

import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { relationship } from "@auto-friend/db/schema/relationship";
import { worldClock } from "@auto-friend/db/schema/world-clock";
import { and, eq, inArray } from "drizzle-orm";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as createAgent } from "../../agent/create/handler";
import { handler } from "./handler";

describe("world.advanceDay", () => {
  test("世界を1日進めると、全員が交流して出来事が生まれる", async () => {
    const db = await createTestDb();
    await seedTestWorld(db, { count: 80 });
    const ctx = await createTestUserContext(db);
    const { agentId } = await createAgent({ ctx, input: buildAgentInput() });

    const result = await handler({ ctx });

    expect(result.day).toBe(4);
    const [clock] = await db.select().from(worldClock);
    expect(clock?.currentDay).toBe(4);
    const mine = await db
      .select()
      .from(agentEvent)
      .where(and(eq(agentEvent.day, 4), eq(agentEvent.actorAgentId, agentId)));
    expect(mine.length).toBeGreaterThan(0);
  });

  test("何日進めても、交際中・恋人の相手は1人につき1人までで、必ず双方向にそろっている", async () => {
    const db = await createTestDb();
    await seedTestWorld(db, { count: 80 });
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });

    for (let i = 0; i < 8; i++) await handler({ ctx });

    const paired = await db
      .select()
      .from(relationship)
      .where(inArray(relationship.state, ["dating", "partner"]));
    const counts = new Map<string, number>();
    for (const r of paired) counts.set(r.sourceAgentId, (counts.get(r.sourceAgentId) ?? 0) + 1);
    expect(Math.max(...counts.values())).toBe(1);
    for (const r of paired) {
      const reverse = paired.find(
        (p) => p.sourceAgentId === r.targetAgentId && p.targetAgentId === r.sourceAgentId,
      );
      expect(reverse).toBeDefined();
    }
  });
});
