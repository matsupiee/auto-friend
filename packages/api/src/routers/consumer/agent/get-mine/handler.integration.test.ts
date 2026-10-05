import { describe, expect, test } from "bun:test";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { buildAvatar } from "../../../../testing/build-avatar";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as createAgent } from "../create/handler";
import { handler } from "./handler";

describe("agent.getMine", () => {
  test("エージェント未作成なら null を返す", async () => {
    const db = await createTestDb();
    const ctx = await createTestUserContext(db);

    expect(await handler({ ctx })).toBeNull();
  });

  test("作成済みなら、今日のいいね数と累計を返す", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });

    const result = await handler({ ctx });

    expect(result?.displayName).toBe("テスト太郎");
    expect(result?.currentDay).toBe(3);
    expect(result?.todayLikeCount).toBeGreaterThanOrEqual(8);
    expect(result?.totalLikeCount).toBe(result?.todayLikeCount);
    expect(result?.partner).toBeNull();
    expect(result?.avatar).toEqual(buildAvatar());
  });

  test("ほかのユーザーのエージェントは返さない", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const owner = await createTestUserContext(db, "owner");
    const other = await createTestUserContext(db, "other");
    await createAgent({ ctx: owner, input: buildAgentInput() });

    expect(await handler({ ctx: other })).toBeNull();
  });
});
