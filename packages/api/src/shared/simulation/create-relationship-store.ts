import type { SimRelationship } from "./simulation-types";

export type RelationshipStore = {
  get: (sourceAgentId: string, targetAgentId: string) => SimRelationship | undefined;
  getOrCreate: (sourceAgentId: string, targetAgentId: string, day: number) => SimRelationship;
  outgoing: (sourceAgentId: string) => SimRelationship[];
  partnerOf: (agentId: string) => string | undefined;
  setState: (relationship: SimRelationship, state: SimRelationship["state"], day: number) => void;
  markTouched: (relationship: SimRelationship) => void;
  touched: () => SimRelationship[];
};

function keyOf(sourceAgentId: string, targetAgentId: string) {
  return `${sourceAgentId}>${targetAgentId}`;
}

// 関係値をメモリ上で引くための入れ物。変更した行だけを覚えておき、あとでまとめてDBに書く。
export function createRelationshipStore(initial: SimRelationship[]): RelationshipStore {
  const byKey = new Map<string, SimRelationship>();
  const bySource = new Map<string, SimRelationship[]>();
  const partners = new Map<string, string>();
  const touchedKeys = new Set<string>();

  const index = (relationship: SimRelationship) => {
    byKey.set(keyOf(relationship.sourceAgentId, relationship.targetAgentId), relationship);
    const list = bySource.get(relationship.sourceAgentId) ?? [];
    list.push(relationship);
    bySource.set(relationship.sourceAgentId, list);
    if (relationship.state === "dating" || relationship.state === "partner") {
      partners.set(relationship.sourceAgentId, relationship.targetAgentId);
    }
  };
  initial.forEach(index);

  const markTouched = (relationship: SimRelationship) => {
    touchedKeys.add(keyOf(relationship.sourceAgentId, relationship.targetAgentId));
  };

  return {
    get: (source, target) => byKey.get(keyOf(source, target)),
    getOrCreate: (source, target, day) => {
      const existing = byKey.get(keyOf(source, target));
      if (existing) return existing;
      const created: SimRelationship = {
        sourceAgentId: source,
        targetAgentId: target,
        attraction: 0,
        trust: 0,
        familiarity: 0,
        chemistry: 0,
        attachment: 0,
        conflict: 0,
        jealousy: 0,
        state: "stranger",
        stateChangedDay: day,
        lastInteractionDay: null,
        interactionStreak: 0,
        likedDay: null,
        cooldownUntilDay: null,
      };
      index(created);
      markTouched(created);
      return created;
    },
    outgoing: (source) => bySource.get(source) ?? [],
    partnerOf: (agentId) => partners.get(agentId),
    setState: (relationship, state, day) => {
      const wasPartner = relationship.state === "dating" || relationship.state === "partner";
      const isPartner = state === "dating" || state === "partner";
      if (isPartner) {
        const current = partners.get(relationship.sourceAgentId);
        if (current && current !== relationship.targetAgentId) {
          throw new Error("an agent can have only one partner");
        }
        partners.set(relationship.sourceAgentId, relationship.targetAgentId);
      } else if (wasPartner) {
        partners.delete(relationship.sourceAgentId);
      }
      relationship.state = state;
      relationship.stateChangedDay = day;
      markTouched(relationship);
    },
    markTouched,
    touched: () => [...touchedKeys].map((key) => byKey.get(key)).filter((r) => r !== undefined),
  };
}
