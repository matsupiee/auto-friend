import { describe, expect, test } from "bun:test";

import { agent } from "@auto-friend/db/schema/agent";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { eq } from "drizzle-orm";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler } from "./handler";

describe("agent.create", () => {
  test("エージェントを作ると、回答からパラメータが決まり、参加初日にいいねと出会いが届く", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);

    const result = await handler({ ctx, input: buildAgentInput() });

    const [created] = await db.select().from(agent).where(eq(agent.id, result.agentId));
    expect(created?.isSakura).toBe(false);
    expect(created?.joinedDay).toBe(3);
    // 1問目「友達を誘って外に出かける」で外向性が上がる
    expect(created?.personality.extroversion).toBeGreaterThan(0.5);
    // 作成画面で組み立てた見た目がそのまま保存される
    expect(created?.avatar).toEqual(buildAgentInput().avatar);

    const events = await db.select().from(agentEvent).where(eq(agentEvent.day, 3));
    const likes = events.filter((e) => e.type === "liked" && e.targetAgentId === result.agentId);
    const met = events.filter((e) => e.type === "first_met" && e.actorAgentId === result.agentId);
    expect(likes.length).toBeGreaterThanOrEqual(8);
    expect(met.length).toBeGreaterThanOrEqual(3);
  });

  test("2体目は作れない", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await handler({ ctx, input: buildAgentInput() });

    expect(handler({ ctx, input: buildAgentInput() })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("18歳未満は作れない", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    const thisYear = new Date().getFullYear();

    expect(
      handler({ ctx, input: { ...buildAgentInput(), birthDate: `${thisYear - 17}-01-01` } }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  test("質問に答えていないと作れない", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);

    expect(handler({ ctx, input: { ...buildAgentInput(), answers: {} } })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  test("世界がまだ無くても、1日目として参加できる", async () => {
    const db = await createTestDb();
    const ctx = await createTestUserContext(db);

    const result = await handler({ ctx, input: buildAgentInput() });

    const [created] = await db.select().from(agent).where(eq(agent.id, result.agentId));
    expect(created?.joinedDay).toBe(1);
  });
});
