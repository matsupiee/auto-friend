import { agent } from "@auto-friend/db/schema/agent";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { relationship } from "@auto-friend/db/schema/relationship";
import { and, count, eq, inArray } from "drizzle-orm";

import type { ProtectedContext } from "../../../../context";
import { getCurrentDay } from "../../../../shared/agent/get-current-day";

export async function handler({ ctx }: { ctx: ProtectedContext }) {
  const [mine] = await ctx.db
    .select()
    .from(agent)
    .where(eq(agent.userId, ctx.session.user.id))
    .limit(1);
  if (!mine) return null;

  const currentDay = await getCurrentDay(ctx.db);
  const likedMe = and(eq(agentEvent.targetAgentId, mine.id), eq(agentEvent.type, "liked"));
  const [today] = await ctx.db
    .select({ value: count() })
    .from(agentEvent)
    .where(and(likedMe, eq(agentEvent.day, currentDay)));
  const [total] = await ctx.db.select({ value: count() }).from(agentEvent).where(likedMe);

  const [partnerRow] = await ctx.db
    .select({ id: agent.id, displayName: agent.displayName, state: relationship.state })
    .from(relationship)
    .innerJoin(agent, eq(agent.id, relationship.targetAgentId))
    .where(
      and(
        eq(relationship.sourceAgentId, mine.id),
        inArray(relationship.state, ["dating", "partner"]),
      ),
    )
    .limit(1);

  return {
    id: mine.id,
    displayName: mine.displayName,
    gender: mine.gender,
    joinedDay: mine.joinedDay,
    currentDay,
    todayLikeCount: today?.value ?? 0,
    totalLikeCount: total?.value ?? 0,
    partner:
      partnerRow && (partnerRow.state === "dating" || partnerRow.state === "partner")
        ? { id: partnerRow.id, displayName: partnerRow.displayName, state: partnerRow.state }
        : null,
  };
}
