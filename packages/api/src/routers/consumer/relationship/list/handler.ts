import { agent } from "@auto-friend/db/schema/agent";
import { relationship } from "@auto-friend/db/schema/relationship";
import { and, eq, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import type { ProtectedContext } from "../../../../context";
import { getMyAgentOrThrow } from "../../../../shared/agent/get-my-agent-or-throw";
import { resolveAvatar } from "../../../../shared/agent/resolve-avatar";

const GROUP_KEYS = ["partner", "crush", "interested", "friend", "acquaintance", "ex"] as const;

export async function handler({ ctx }: { ctx: ProtectedContext }) {
  const me = await getMyAgentOrThrow(ctx.db, ctx.session.user.id);
  const reverse = alias(relationship, "reverse");

  const rows = await ctx.db
    .select({
      agentId: agent.id,
      displayName: agent.displayName,
      gender: agent.gender,
      avatar: agent.avatar,
      state: relationship.state,
      attraction: relationship.attraction,
      trust: relationship.trust,
      familiarity: relationship.familiarity,
      interactionStreak: relationship.interactionStreak,
      lastInteractionDay: relationship.lastInteractionDay,
      reverseLikedDay: reverse.likedDay,
    })
    .from(relationship)
    .innerJoin(agent, eq(agent.id, relationship.targetAgentId))
    .leftJoin(
      reverse,
      and(
        eq(reverse.sourceAgentId, relationship.targetAgentId),
        eq(reverse.targetAgentId, relationship.sourceAgentId),
      ),
    )
    .where(eq(relationship.sourceAgentId, me.id));

  const items = rows.map((row) => ({
    agent: {
      id: row.agentId,
      displayName: row.displayName,
      gender: row.gender,
      avatar: resolveAvatar({ id: row.agentId, gender: row.gender, avatar: row.avatar }),
    },
    state: row.state,
    attraction: Math.round(row.attraction),
    trust: Math.round(row.trust),
    familiarity: Math.round(row.familiarity),
    likedMe: row.reverseLikedDay !== null,
    interactionStreak: row.interactionStreak,
    lastInteractionDay: row.lastInteractionDay,
  }));

  const groups = GROUP_KEYS.map((key) => ({
    key,
    items: items
      .filter((item) =>
        key === "partner"
          ? item.state === "dating" || item.state === "partner"
          : item.state === key,
      )
      .sort((a, b) => b.familiarity + b.attraction - (a.familiarity + a.attraction)),
  }));

  const admirers = items
    .filter((item) => item.state === "stranger" && item.likedMe)
    .map((item) => item.agent);

  // 念のため、相手からのいいねがあるのに自分側の行がない場合も拾う
  const incoming = await ctx.db
    .select({
      id: agent.id,
      displayName: agent.displayName,
      gender: agent.gender,
      avatar: agent.avatar,
    })
    .from(relationship)
    .innerJoin(agent, eq(agent.id, relationship.sourceAgentId))
    .where(and(eq(relationship.targetAgentId, me.id), isNotNull(relationship.likedDay)));
  const known = new Set(items.map((item) => item.agent.id));
  for (const liker of incoming)
    if (!known.has(liker.id)) admirers.push({ ...liker, avatar: resolveAvatar(liker) });

  return { groups, admirers };
}
