import { describe, expect, test } from "bun:test";

import { agent } from "@auto-friend/db/schema/agent";
import { relationship } from "@auto-friend/db/schema/relationship";
import { count, eq } from "drizzle-orm";

import { buildAgentInput } from "../../../../testing/build-agent-input";
import { buildAvatar } from "../../../../testing/build-avatar";
import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as createAgent } from "../create/handler";
import { handler as getMine } from "../get-mine/handler";
import { agentUpdateAvatarInputSchema } from "./route";
import { handler } from "./handler";

describe("agent.updateAvatar", () => {
  test("見た目を作り直すと、次に開いたときから新しい見た目になる", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    await createAgent({ ctx, input: buildAgentInput() });
    const avatar = {
      ...buildAvatar(),
      hair: { style: "ponytail" as const, color: "pink" as const, flip: true },
      eye: {
        style: "big" as const,
        color: "blue" as const,
        y: -2,
        size: 3,
        rotation: 1,
        spacing: -1,
      },
      favoriteColor: "yellow" as const,
    };

    await handler({ ctx, input: { avatar } });

    expect((await getMine({ ctx }))?.avatar).toEqual(avatar);
  });

  test("見た目を変えても、関係は変わらない", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const ctx = await createTestUserContext(db);
    const { agentId } = await createAgent({ ctx, input: buildAgentInput() });
    const countRelationships = async () =>
      (
        await db
          .select({ value: count() })
          .from(relationship)
          .where(eq(relationship.targetAgentId, agentId))
      )[0]?.value;
    const before = await countRelationships();

    await handler({ ctx, input: { avatar: { ...buildAvatar(), favoriteColor: "red" } } });

    expect(await countRelationships()).toBe(before);
  });

  test("ほかのユーザーのエージェントの見た目は変わらない", async () => {
    const db = await createTestDb();
    await seedTestWorld(db);
    const owner = await createTestUserContext(db, "owner");
    const other = await createTestUserContext(db, "other");
    const { agentId } = await createAgent({ ctx: owner, input: buildAgentInput() });
    await createAgent({ ctx: other, input: buildAgentInput() });

    await handler({ ctx: other, input: { avatar: { ...buildAvatar(), favoriteColor: "red" } } });

    const [ownerAgent] = await db.select().from(agent).where(eq(agent.id, agentId));
    expect(ownerAgent?.avatar).toEqual(buildAvatar());
  });

  test("エージェント未作成なら変えられない", async () => {
    const db = await createTestDb();
    const ctx = await createTestUserContext(db);

    expect(handler({ ctx, input: { avatar: buildAvatar() } })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  test("存在しないパーツや、調整幅を超える値は受け付けない", () => {
    const valid = buildAvatar();
    expect(agentUpdateAvatarInputSchema.safeParse({ avatar: valid }).success).toBe(true);
    expect(
      agentUpdateAvatarInputSchema.safeParse({
        avatar: { ...valid, hair: { ...valid.hair, style: "mohawk" } },
      }).success,
    ).toBe(false);
    expect(
      agentUpdateAvatarInputSchema.safeParse({
        avatar: { ...valid, eye: { ...valid.eye, size: 99 } },
      }).success,
    ).toBe(false);
    expect(
      agentUpdateAvatarInputSchema.safeParse({
        avatar: { ...valid, body: { height: 101, build: 50 } },
      }).success,
    ).toBe(false);
  });
});
