import { describe, expect, test } from "bun:test";

import { relationship } from "@auto-friend/db/schema/relationship";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as createAgent } from "../../agent/create/handler";
import { handler } from "./handler";

describe("relationship.list", () => {
  test("参加直後は、出会った相手が知り合いに、いいねだけの相手がいいねをくれた人に並ぶ", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });

    const result = await handler({ ctx });

    const acquaintances = result.groups.find((g) => g.key === "acquaintance")?.items ?? [];
    expect(acquaintances.length).toBeGreaterThanOrEqual(3);
    expect(result.admirers.length).toBeGreaterThan(0);
  });

  test("交際中の相手は partner グループに入る", async () => {
    const db = await createTestDb();
    const sakura = await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    const { agentId } = await createAgent({ ctx, input: buildAgentInput() });
    const single = sakura.find((s) => s.gender === "female");
    if (!single) throw new Error("seed failed");
    await db.delete(relationship);
    await db.insert(relationship).values([
      {
        sourceAgentId: agentId,
        targetAgentId: single.id,
        state: "dating",
        stateChangedDay: 3,
        familiarity: 70,
      },
      {
        sourceAgentId: single.id,
        targetAgentId: agentId,
        state: "dating",
        stateChangedDay: 3,
        familiarity: 70,
      },
    ]);

    const result = await handler({ ctx });

    const partner = result.groups.find((g) => g.key === "partner")?.items ?? [];
    expect(partner.map((p) => p.agent.id)).toEqual([single.id]);
  });
});
