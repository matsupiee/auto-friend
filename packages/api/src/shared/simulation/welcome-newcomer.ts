import { computeCompatibility } from "../agent/compute-compatibility";
import { applyInteraction } from "./apply-interaction";
import type { RelationshipStore } from "./create-relationship-store";
import type { Rng } from "./create-rng";
import { giveLikes } from "./give-likes";
import type { SimAgent, SimEvent, WorldContext } from "./simulation-types";

// 世界に参加した初日の歓迎。要件定義 1.2 の「初日にまあまあもらえる」を必ず満たすため、
// 通常の1日とは別に、いいねと新しい出会いをまとめて発生させる。
export function welcomeNewcomer(input: {
  day: number;
  newcomer: SimAgent;
  agents: SimAgent[];
  store: RelationshipStore;
  rng: Rng;
  fromMinute: number;
}): SimEvent[] {
  const { day, newcomer, agents, store, rng, fromMinute } = input;
  const world: WorldContext = {
    day,
    agents: new Map(agents.map((agent) => [agent.id, agent])),
    store,
    rng,
    events: [],
    dailyInteractions: new Map(),
  };
  const minuteRange = { from: fromMinute, to: Math.min(1439, fromMinute + 180) };

  giveLikes(world, newcomer, rng.int(8, 14), minuteRange);

  // 共通点の多い相手から順に、何人かと出会う
  const others = agents.filter((agent) => agent.id !== newcomer.id);
  if (others.length === 0) return world.events;
  const sample = Array.from({ length: 40 }, () => rng.pick(others));
  const unique = [...new Map(sample.map((agent) => [agent.id, agent])).values()];
  const partners = unique
    .map((agent) => ({ agent, score: computeCompatibility(newcomer, agent) + rng.next() * 0.15 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, rng.int(3, 4));
  for (const { agent } of partners) {
    applyInteraction(
      world,
      newcomer,
      agent,
      "first_meet",
      rng.int(minuteRange.from, minuteRange.to),
    );
  }
  const closest = partners[0]?.agent;
  if (closest) {
    applyInteraction(world, closest, newcomer, "hobby_talk", minuteRange.to);
  }

  return world.events.sort((a, b) => a.minuteOfDay - b.minuteOfDay);
}
