import { describe, expect, test } from "bun:test";

import { relationship } from "@auto-friend/db/schema/relationship";
import { and, eq } from "drizzle-orm";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as createAgent } from "../create/handler";
import { handler } from "./handler";

describe("agent.get", () => {
  test("自分のエージェントなら、恋愛傾向まで返す", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    const { agentId } = await createAgent({ ctx, input: buildAgentInput() });

    const result = await handler({ ctx, input: { agentId } });

    expect(result.isMine).toBe(true);
    expect(result.personality).toHaveLength(8);
    expect(result.romance).toHaveLength(8);
    expect(result.recentEvents.length).toBeGreaterThan(0);
    expect(result.myRelation).toBeNull();
  });

  test("他人のエージェントなら、恋愛傾向と片思いの相手は見せない", async () => {
    const db = await createTestDb();
    const sakura = await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });
    const [someone, crushTarget] = sakura;
    if (!someone || !crushTarget) throw new Error("seed failed");
    await db
      .insert(relationship)
      .values({
        sourceAgentId: someone.id,
        targetAgentId: crushTarget.id,
        state: "crush",
        attraction: 99,
        familiarity: 99,
        stateChangedDay: 1,
      })
      .onConflictDoUpdate({
        target: [relationship.sourceAgentId, relationship.targetAgentId],
        set: { state: "crush", attraction: 99, familiarity: 99 },
      });

    const result = await handler({ ctx, input: { agentId: someone.id } });

    expect(result.isMine).toBe(false);
    expect(result.romance).toBeNull();
    expect(result.myRelation).not.toBeNull();
    const shown = result.closeAgents.find((a) => a.id === crushTarget.id);
    expect(shown?.state).toBe("friend");
    const [stored] = await db
      .select()
      .from(relationship)
      .where(
        and(
          eq(relationship.sourceAgentId, someone.id),
          eq(relationship.targetAgentId, crushTarget.id),
        ),
      );
    expect(stored?.state).toBe("crush");
  });

  test("存在しないエージェントは NOT_FOUND", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });

    expect(handler({ ctx, input: { agentId: "missing" } })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  test("自分のエージェントが未作成なら PRECONDITION_FAILED", async () => {
    const db = await createTestDb();
    const sakura = await seedTestWorld(db);
    const ctx = await createTestUserContext(db);

    expect(handler({ ctx, input: { agentId: sakura[0]?.id ?? "" } })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });
});
