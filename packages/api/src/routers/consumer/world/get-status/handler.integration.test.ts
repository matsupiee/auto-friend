import { describe, expect, test } from "bun:test";

import { createTestDb } from "../../../../testing/create-test-db";
import { createTestUserContext } from "../../../../testing/create-test-user-context";
import { seedTestWorld } from "../../../../testing/seed-test-world";
import { handler as advanceDay } from "../advance-day/handler";
import { handler } from "./handler";

describe("world.getStatus", () => {
  test("世界の人口とカップル数、恋愛ニュースを返す", async () => {
    const db = await createTestDb();
    await seedTestWorld(db, { count: 80 });
    const ctx = await createTestUserContext(db);
    for (let i = 0; i < 4; i++) await advanceDay({ ctx });

    const result = await handler({ ctx });

    expect(result.currentDay).toBe(7);
    expect(result.population).toBe(80);
    expect(result.coupleCount).toBeGreaterThan(0);
    for (const headline of result.headlines) expect(headline.day).toBeGreaterThanOrEqual(6);
  });
});
