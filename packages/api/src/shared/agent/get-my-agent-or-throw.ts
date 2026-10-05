import type { DbExecutor } from "@auto-friend/db";
import { agent } from "@auto-friend/db/schema/agent";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

// ログイン中のユーザーが持つエージェントを返す。まだ作っていなければ PRECONDITION_FAILED にする。
export async function getMyAgentOrThrow(db: DbExecutor, userId: string) {
  const [mine] = await db.select().from(agent).where(eq(agent.userId, userId)).limit(1);
  if (!mine) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "エージェントがまだ作られていません",
    });
  }
  return mine;
}
