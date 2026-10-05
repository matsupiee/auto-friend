import { agent } from "@auto-friend/db/schema/agent";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { relationship } from "@auto-friend/db/schema/relationship";
import { and, count, desc, eq, gte, inArray } from "drizzle-orm";

import type { ProtectedContext } from "../../../../context";
import { getCurrentDay } from "../../../../shared/agent/get-current-day";
import { renderEventText } from "../../../../shared/event/render-event-text";

const HEADLINE_TYPES = [
  "confession_accepted",
  "became_partners",
  "broke_up",
  "confession_rejected",
  "confessed",
] as const;

export async function handler({ ctx }: { ctx: ProtectedContext }) {
  const currentDay = await getCurrentDay(ctx.db);
  const [population] = await ctx.db.select({ value: count() }).from(agent);
  const [paired] = await ctx.db
    .select({ value: count() })
    .from(relationship)
    .where(inArray(relationship.state, ["dating", "partner"]));

  const events = await ctx.db
    .select()
    .from(agentEvent)
    .where(
      and(
        gte(agentEvent.day, currentDay - 1),
        eq(agentEvent.importance, 2),
        inArray(agentEvent.type, [...HEADLINE_TYPES]),
      ),
    )
    .orderBy(desc(agentEvent.day), desc(agentEvent.minuteOfDay))
    .limit(12);

  const ids = [
    ...new Set(events.flatMap((e) => [e.actorAgentId, e.targetAgentId ?? e.actorAgentId])),
  ];
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
    currentDay,
    population: population?.value ?? 0,
    coupleCount: Math.floor((paired?.value ?? 0) / 2),
    headlines: events.flatMap((e) => {
      const text = renderEventText(e, null, (id) => names.get(id) ?? "誰か");
      return text ? [{ id: e.id, day: e.day, minuteOfDay: e.minuteOfDay, text }] : [];
    }),
  };
}
