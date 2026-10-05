import type { Database } from "@auto-friend/db";
import { user } from "@auto-friend/db/schema/auth";

import type { ProtectedContext } from "../context";

// ログイン済みユーザーを1人作り、そのユーザーとしてAPIを呼ぶためのコンテキストを返す。
export async function createTestUserContext(
  db: Database,
  name = "テストユーザー",
): Promise<ProtectedContext> {
  const id = crypto.randomUUID();
  const now = new Date();
  const [created] = await db
    .insert(user)
    .values({ id, name, email: `${id}@example.test`, emailVerified: true })
    .returning();
  if (!created) throw new Error("failed to create test user");
  return {
    db,
    session: {
      user: { ...created, image: created.image ?? null },
      session: {
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        userId: id,
        expiresAt: new Date(now.getTime() + 86400000),
        createdAt: now,
        updatedAt: now,
        ipAddress: null,
        userAgent: null,
      },
    } as ProtectedContext["session"],
  };
}
