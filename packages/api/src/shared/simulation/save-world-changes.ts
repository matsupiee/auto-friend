import type { Transaction } from "@auto-friend/db";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { relationship } from "@auto-friend/db/schema/relationship";
import { sql } from "drizzle-orm";

import type { RelationshipStore } from "./create-relationship-store";
import type { SimEvent, SimRelationship } from "./simulation-types";

const CHUNK = 100;

function chunks<T>(items: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += CHUNK) result.push(items.slice(i, i + CHUNK));
  return result;
}

function toValues(r: SimRelationship) {
  return {
    sourceAgentId: r.sourceAgentId,
    targetAgentId: r.targetAgentId,
    attraction: r.attraction,
    trust: r.trust,
    familiarity: r.familiarity,
    chemistry: r.chemistry,
    attachment: r.attachment,
    conflict: r.conflict,
    jealousy: r.jealousy,
    state: r.state,
    stateChangedDay: r.stateChangedDay,
    lastInteractionDay: r.lastInteractionDay,
    interactionStreak: r.interactionStreak,
    likedDay: r.likedDay,
    cooldownUntilDay: r.cooldownUntilDay,
  };
}

// シミュレーションで変わった関係値と、発生したイベントをDBに書き込む。
// 交際中・恋人の行は「1人につき1件」の一意制約があるため、別れなどで状態が外れる行を先に書く。
export async function saveWorldChanges(
  tx: Transaction,
  store: RelationshipStore,
  events: SimEvent[],
): Promise<void> {
  const touched = store.touched();
  const isPartner = (r: SimRelationship) => r.state === "dating" || r.state === "partner";
  const ordered = [...touched.filter((r) => !isPartner(r)), ...touched.filter(isPartner)];

  for (const chunk of chunks(ordered)) {
    await tx
      .insert(relationship)
      .values(chunk.map(toValues))
      .onConflictDoUpdate({
        target: [relationship.sourceAgentId, relationship.targetAgentId],
        set: {
          attraction: sql`excluded.attraction`,
          trust: sql`excluded.trust`,
          familiarity: sql`excluded.familiarity`,
          chemistry: sql`excluded.chemistry`,
          attachment: sql`excluded.attachment`,
          conflict: sql`excluded.conflict`,
          jealousy: sql`excluded.jealousy`,
          state: sql`excluded.state`,
          stateChangedDay: sql`excluded.state_changed_day`,
          lastInteractionDay: sql`excluded.last_interaction_day`,
          interactionStreak: sql`excluded.interaction_streak`,
          likedDay: sql`excluded.liked_day`,
          cooldownUntilDay: sql`excluded.cooldown_until_day`,
          updatedAt: new Date(),
        },
      });
  }

  for (const chunk of chunks(events)) {
    await tx.insert(agentEvent).values(chunk);
  }
}
