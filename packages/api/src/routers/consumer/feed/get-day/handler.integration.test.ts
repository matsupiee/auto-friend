import { describe, expect, test } from "bun:test";

import { agentEvent } from "@auto-friend/db/schema/agent-event";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as createAgent } from "../../agent/create/handler";
import { handler } from "./handler";

describe("feed.getDay", () => {
  test("今日の出来事を時刻順に返し、いいね数と日記をつける", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });

    const result = await handler({ ctx, input: {} });

    expect(result.day).toBe(3);
    expect(result.firstDay).toBe(3);
    expect(result.stats.likes).toBeGreaterThanOrEqual(8);
    expect(result.events.some((e) => e.text.includes("いいねが届きました"))).toBe(true);
    const minutes = result.events.map((e) => e.minuteOfDay);
    expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
    expect(result.diary.length).toBeGreaterThan(0);
    // 相手のいる出来事には、相手の見た目がつく
    const withCounterpart = result.events.filter((e) => e.counterpart);
    expect(withCounterpart.length).toBeGreaterThan(0);
    for (const e of withCounterpart) expect(e.counterpart?.avatar.face.shape).toBeDefined();
  });

  test("相手が自分を好きになった出来事は、名前を伏せて見せる", async () => {
    const db = await createTestDb();
    const sakura = await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    const { agentId } = await createAgent({ ctx, input: buildAgentInput() });
    const admirer = sakura[0];
    if (!admirer) throw new Error("seed failed");
    await db.insert(agentEvent).values({
      day: 3,
      minuteOfDay: 600,
      type: "fell_for",
      actorAgentId: admirer.id,
      targetAgentId: agentId,
      importance: 2,
    });

    const result = await handler({ ctx, input: {} });

    const secret = result.events.find((e) => e.type === "fell_for");
    expect(secret?.text).toBe("誰かがあなたのエージェントに片思いしているようです");
    expect(secret?.counterpart).toBeNull();
  });

  test("参加前の日や未来の日を指定しても、参加日〜今日の範囲に収める", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });

    expect((await handler({ ctx, input: { day: 1 } })).day).toBe(3);
    expect((await handler({ ctx, input: { day: 99 } })).day).toBe(3);
  });
});
