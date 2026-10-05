import type { DbExecutor } from "@auto-friend/db";
import { agent } from "@auto-friend/db/schema/agent";
import { relationship } from "@auto-friend/db/schema/relationship";
import { worldClock } from "@auto-friend/db/schema/world-clock";

import { createRelationshipStore } from "./create-relationship-store";
import type { RelationshipStore } from "./create-relationship-store";
import type { SimAgent } from "./simulation-types";

export type LoadedWorld = {
  currentDay: number;
  agents: SimAgent[];
  store: RelationshipStore;
};

// シミュレーションに必要な世界の状態をまとめてメモリに読み込む。
export async function loadWorld(db: DbExecutor): Promise<LoadedWorld> {
  const [clock] = await db.select().from(worldClock).limit(1);
  const agentRows = await db.select().from(agent);
  const relationshipRows = await db.select().from(relationship);

  return {
    currentDay: clock?.currentDay ?? 1,
    agents: agentRows.map((row) => ({
      id: row.id,
      isSakura: row.isSakura,
      displayName: row.displayName,
      gender: row.gender,
      romanticPreference: row.romanticPreference,
      birthplace: row.birthplace,
      schoolType: row.schoolType,
      club: row.club,
      circle: row.circle,
      hobbies: row.hobbies,
      personality: row.personality,
      romance: row.romance,
      preference: row.preference,
      appearance: row.appearance,
      joinedDay: row.joinedDay,
    })),
    store: createRelationshipStore(
      relationshipRows.map((row) => ({
        id: row.id,
        sourceAgentId: row.sourceAgentId,
        targetAgentId: row.targetAgentId,
        attraction: row.attraction,
        trust: row.trust,
        familiarity: row.familiarity,
        chemistry: row.chemistry,
        attachment: row.attachment,
        conflict: row.conflict,
        jealousy: row.jealousy,
        state: row.state,
        stateChangedDay: row.stateChangedDay,
        lastInteractionDay: row.lastInteractionDay,
        interactionStreak: row.interactionStreak,
        likedDay: row.likedDay,
        cooldownUntilDay: row.cooldownUntilDay,
      })),
    ),
  };
}
