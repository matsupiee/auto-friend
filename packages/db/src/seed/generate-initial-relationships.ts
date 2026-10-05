import type { Gender, RelationshipStateName } from "../constants/agent-parameters";
import type { relationship } from "../schema/relationship";
import type { SeedRng } from "./create-seed-rng";

type RelationshipInsert = typeof relationship.$inferInsert;

export type SeedAgent = {
  id: string;
  gender: Gender;
  romanticPreference: Gender[];
};

const canBeRomantic = (a: SeedAgent, b: SeedAgent) => a.romanticPreference.includes(b.gender);

// サクラ同士の初期の人間関係を作る。世界が「すでに動いている」状態から始められるように、
// 友人・交際中のカップル・片思い・元恋人をあらかじめ散りばめておく。
export function generateInitialRelationships(
  rng: SeedRng,
  agents: SeedAgent[],
): Map<string, RelationshipInsert> {
  const result = new Map<string, RelationshipInsert>();
  const keyOf = (a: string, b: string) => `${a}>${b}`;
  const set = (
    source: SeedAgent,
    target: SeedAgent,
    state: RelationshipStateName,
    values: Partial<RelationshipInsert>,
  ) => {
    result.set(keyOf(source.id, target.id), {
      sourceAgentId: source.id,
      targetAgentId: target.id,
      state,
      stateChangedDay: -rng.int(0, 20),
      lastInteractionDay: rng.chance(0.5) ? 0 : -rng.int(1, 5),
      ...values,
    });
  };
  const friendValues = () => {
    const familiarity = rng.int(10, 60);
    const trust = rng.int(8, 50);
    return { familiarity, trust, chemistry: rng.int(20, 70), attraction: rng.int(0, 30) };
  };

  // 友人・知り合い
  for (const agent of agents) {
    for (const other of rng.sample(agents, rng.int(3, 8))) {
      if (other.id === agent.id || result.has(keyOf(agent.id, other.id))) continue;
      for (const [a, b] of [
        [agent, other],
        [other, agent],
      ] as const) {
        const values = friendValues();
        const state = values.familiarity >= 25 && values.trust >= 12 ? "friend" : "acquaintance";
        set(a, b, state, { ...values, attraction: canBeRomantic(a, b) ? values.attraction : 0 });
      }
    }
  }

  // 交際中のカップル。1人につき相手は1人まで
  const taken = new Set<string>();
  const shuffled = rng.sample(agents, agents.length);
  for (const agent of shuffled) {
    if (taken.size >= agents.length * 0.25) break;
    if (taken.has(agent.id)) continue;
    const partner = shuffled.find(
      (other) =>
        other.id !== agent.id &&
        !taken.has(other.id) &&
        canBeRomantic(agent, other) &&
        canBeRomantic(other, agent),
    );
    if (!partner) continue;
    taken.add(agent.id);
    taken.add(partner.id);
    const state = rng.chance(0.6) ? "partner" : "dating";
    for (const [a, b] of [
      [agent, partner],
      [partner, agent],
    ] as const) {
      set(a, b, state, {
        attraction: rng.int(55, 90),
        trust: rng.int(50, 85),
        familiarity: rng.int(60, 95),
        chemistry: rng.int(50, 90),
        attachment: rng.int(45, 85),
        conflict: rng.int(0, 25),
        lastInteractionDay: 0,
      });
    }
  }

  // 片思い・気になる相手・元恋人
  for (const agent of agents) {
    const roll = rng.next();
    const target = rng.pick(agents);
    if (target.id === agent.id || !canBeRomantic(agent, target)) continue;
    const existing = result.get(keyOf(agent.id, target.id));
    if (existing && (existing.state === "dating" || existing.state === "partner")) continue;
    if (roll < 0.2 && !taken.has(agent.id)) {
      set(agent, target, "crush", {
        attraction: rng.int(63, 82),
        trust: rng.int(25, 55),
        familiarity: rng.int(30, 60),
        chemistry: rng.int(40, 80),
        attachment: rng.int(30, 60),
      });
    } else if (roll < 0.4) {
      set(agent, target, "interested", {
        attraction: rng.int(45, 60),
        trust: rng.int(15, 45),
        familiarity: rng.int(25, 50),
        chemistry: rng.int(30, 70),
        attachment: rng.int(5, 30),
      });
    } else if (roll < 0.48 && canBeRomantic(target, agent)) {
      const reverse = result.get(keyOf(target.id, agent.id));
      if (reverse && (reverse.state === "dating" || reverse.state === "partner")) continue;
      for (const [a, b] of [
        [agent, target],
        [target, agent],
      ] as const) {
        set(a, b, "ex", {
          attraction: rng.int(5, 35),
          trust: rng.int(10, 40),
          familiarity: rng.int(50, 85),
          chemistry: rng.int(20, 60),
          attachment: rng.int(5, 30),
          conflict: rng.int(5, 40),
        });
      }
    } else {
      continue;
    }
    // 片思いされている側が相手を知らないのは不自然なので、知り合い以上にしておく
    if (!result.has(keyOf(target.id, agent.id))) {
      set(target, agent, "acquaintance", { ...friendValues(), attraction: 0 });
    }
  }

  return result;
}
