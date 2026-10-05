import { agent } from "@auto-friend/db/schema/agent";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { and, asc, eq, gte, inArray, or } from "drizzle-orm";

import type { ProtectedContext } from "../../../../context";
import { renderEventText } from "../../../../shared/event/render-event-text";
import { runWorldDay } from "../../../../shared/simulation/run-world-day";

export async function handler({ ctx }: { ctx: ProtectedContext }) {
  const { day, eventCount } = await runWorldDay(ctx.db);

  const [mine] = await ctx.db
    .select()
    .from(agent)
    .where(eq(agent.userId, ctx.session.user.id))
    .limit(1);
  if (!mine) return { day, eventCount, notifications: [] };

  const important = await ctx.db
    .select()
    .from(agentEvent)
    .where(
      and(
        eq(agentEvent.day, day),
        gte(agentEvent.importance, 2),
        or(eq(agentEvent.actorAgentId, mine.id), eq(agentEvent.targetAgentId, mine.id)),
      ),
    )
    .orderBy(asc(agentEvent.minuteOfDay));
  const ids = [
    ...new Set(important.flatMap((e) => [e.actorAgentId, e.targetAgentId, e.payload.thirdAgentId])),
  ].filter((id): id is string => typeof id === "string");
  const names = new Map(
    ids.length === 0
      ? []
      : (
          await ctx.db
            .select({ id: agent.id, displayName: agent.displayName })
            .from(agent)
            .where(inArray(agent.id, ids))
        ).map((a) => [a.id, a.displayName]),
  );

  return {
    day,
    eventCount,
    notifications: important
      .map((e) => renderEventText(e, mine.id, (id) => names.get(id) ?? "誰か"))
      .filter((text): text is string => text !== null),
  };
}
