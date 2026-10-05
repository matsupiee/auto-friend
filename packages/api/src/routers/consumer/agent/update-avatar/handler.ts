import { agent } from "@auto-friend/db/schema/agent";
import { eq } from "drizzle-orm";
import type z from "zod";

import type { ProtectedContext } from "../../../../context";
import { getMyAgentOrThrow } from "../../../../shared/agent/get-my-agent-or-throw";
import type { agentUpdateAvatarInputSchema } from "./route";

export async function handler({
  ctx,
  input,
}: {
  ctx: ProtectedContext;
  input: z.infer<typeof agentUpdateAvatarInputSchema>;
}) {
  const mine = await getMyAgentOrThrow(ctx.db, ctx.session.user.id);
  await ctx.db.update(agent).set({ avatar: input.avatar }).where(eq(agent.id, mine.id));
  return { avatar: input.avatar };
}
