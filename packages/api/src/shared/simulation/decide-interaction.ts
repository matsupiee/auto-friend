import { canBeRomantic } from "../agent/can-be-romantic";
import { computeCompatibility } from "../agent/compute-compatibility";
import type { Candidate, InteractionAction, SimAgent, WorldContext } from "./simulation-types";

const KIND_WEIGHT: Record<Candidate["kind"], number> = {
  partner: 3,
  crush: 2.2,
  interested: 1.6,
  friend: 1.2,
  acquaintance: 0.9,
  admirer: 1.1,
  new: 0.8,
};

export type InteractionDecision = { targetId: string; action: InteractionAction } | { alone: true };

// Jev（要件定義 10.3）。誰と交流するか、何をするかを性格と関係値から確率的に選ぶ。
// 選ぶだけで、実行できるかどうかは validateAction が判定する。
export function decideInteraction(
  world: WorldContext,
  agent: SimAgent,
  candidates: Candidate[],
): InteractionDecision {
  const { rng, store } = world;
  const p = agent.personality;
  const r = agent.romance;

  const options: Array<Candidate | "alone"> = [...candidates, "alone"];
  const chosen = rng.weighted(options, (option) => {
    if (option === "alone") return 0.3 + (1 - p.extroversion) * 0.7;
    const other = world.agents.get(option.agentId);
    if (!other) return 0;
    let weight = KIND_WEIGHT[option.kind];
    if (option.kind === "crush") weight += r.romanticDrive;
    if (option.kind === "new") weight += p.openness * 0.6 + p.extroversion * 0.4;
    // 実ユーザーのエージェントは物語の主人公。サクラから話しかけられやすくする
    if (!other.isSakura) weight *= 1.8;
    return weight * (0.6 + computeCompatibility(agent, other));
  });
  if (!chosen || chosen === "alone") return { alone: true };

  const target = world.agents.get(chosen.agentId);
  const relationship = store.get(agent.id, chosen.agentId);
  if (!target || !relationship || relationship.state === "stranger") {
    return { targetId: chosen.agentId, action: "first_meet" };
  }

  if (relationship.conflict >= 50) {
    const action = rng.weighted(["keep_distance", "make_up"] as const, (a) =>
      a === "keep_distance" ? 1 - r.forgiveness : r.forgiveness + p.agreeableness,
    );
    return { targetId: target.id, action: action ?? "keep_distance" };
  }

  const shareHobby = agent.hobbies.some((hobby) => target.hobbies.includes(hobby));
  const romantic = canBeRomantic(agent, target);
  const actions: Array<[InteractionAction, number]> = [
    ["chat", 1],
    ["hobby_talk", shareHobby ? 1.2 : 0],
    ["consult", relationship.trust >= 40 ? 0.5 + p.emotionality * 0.5 : 0],
  ];
  const isPartner = relationship.state === "dating" || relationship.state === "partner";
  if (isPartner) {
    actions.push(["invite_date", 1.5]);
  } else if (romantic && (relationship.state === "interested" || relationship.state === "crush")) {
    actions.push(["hint_affection", 0.4 + r.flirtiness]);
    if (relationship.attraction >= 55 && relationship.familiarity >= 35) {
      actions.push(["invite_date", 0.3 + r.initiative]);
    }
  }
  const action = rng.weighted(actions, ([, weight]) => weight);
  return { targetId: target.id, action: action?.[0] ?? "chat" };
}
