import type { RelationshipStore } from "./create-relationship-store";
import type { Rng } from "./create-rng";
import { applyInteraction } from "./apply-interaction";
import { decideDailyLikeCount } from "./decide-daily-like-count";
import { decideInteraction } from "./decide-interaction";
import { giveLikes } from "./give-likes";
import { runRomanceDecisions } from "./run-romance-decisions";
import { selectCandidates } from "./select-candidates";
import type { SimAgent, SimEvent, WorldContext } from "./simulation-types";
import { validateAction } from "./validate-action";

const DAY_START = 7 * 60;
const DAY_END = 23 * 60 + 30;

// 1日ぶんの世界を進める。全エージェントの交流をその日の時刻順に処理し、最後に恋愛の判断を行う。
// store の関係値を直接書き換え、発生したイベントを返す。
export function simulateDay(input: {
  day: number;
  agents: SimAgent[];
  store: RelationshipStore;
  rng: Rng;
}): SimEvent[] {
  const { day, agents, store, rng } = input;
  const world: WorldContext = {
    day,
    agents: new Map(agents.map((agent) => [agent.id, agent])),
    store,
    rng,
    events: [],
    dailyInteractions: new Map(),
  };

  // Scheduler（要件定義 10.1）。外向的なエージェントほど交流の機会が多い
  const slots: Array<{ agent: SimAgent; minute: number }> = [];
  for (const agent of agents) {
    const count =
      2 +
      Math.floor(agent.personality.extroversion * 3) +
      (rng.chance(0.3) ? 1 : 0) +
      (agent.isSakura ? 0 : 2);
    for (let i = 0; i < count; i++) slots.push({ agent, minute: rng.int(DAY_START, DAY_END) });
  }
  slots.sort((a, b) => a.minute - b.minute);

  for (const { agent, minute } of slots) {
    const decision = decideInteraction(world, agent, selectCandidates(world, agent));
    const target = "alone" in decision ? undefined : world.agents.get(decision.targetId);
    const action =
      target && !("alone" in decision)
        ? validateAction(world, agent, target, decision.action)
        : null;
    if (!target || !action) {
      if (!agent.isSakura && agent.hobbies.length > 0) {
        world.events.push({
          day,
          minuteOfDay: minute,
          type: "spent_alone",
          actorAgentId: agent.id,
          targetAgentId: null,
          importance: 0,
          payload: { hobby: rng.pick(agent.hobbies) },
        });
      }
      continue;
    }
    applyInteraction(world, agent, target, action, minute);
  }

  for (const agent of agents) {
    giveLikes(world, agent, decideDailyLikeCount(agent, rng), { from: DAY_START, to: DAY_END });
  }

  runRomanceDecisions(world);

  // 時間が経つと、揉めごとや嫉妬は少しずつ落ち着き、会っていない相手への気持ちは薄れる
  for (const agent of agents) {
    for (const relationship of store.outgoing(agent.id)) {
      let changed = false;
      if (relationship.conflict > 0) {
        relationship.conflict = Math.max(0, relationship.conflict - 2);
        changed = true;
      }
      if (relationship.jealousy > 0) {
        relationship.jealousy = Math.max(0, relationship.jealousy - 4);
        changed = true;
      }
      const absent =
        relationship.lastInteractionDay !== null && relationship.lastInteractionDay < day - 3;
      if (absent && (relationship.state === "crush" || relationship.state === "interested")) {
        relationship.attraction = Math.max(0, relationship.attraction - 1);
        changed = true;
      }
      if (changed) store.markTouched(relationship);
    }
  }

  return world.events.sort((a, b) => a.minuteOfDay - b.minuteOfDay);
}
