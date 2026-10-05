import type { AgentEventType } from "@auto-friend/db/constants/agent-parameters";

import { canBeRomantic } from "../agent/can-be-romantic";
import { computeCompatibility } from "../agent/compute-compatibility";
import { computePreferenceMatch } from "../agent/compute-preference-match";
import { resolveStateTransition } from "./resolve-state-transition";
import type {
  InteractionAction,
  InteractionOutcome,
  SimAgent,
  SimRelationship,
  WorldContext,
} from "./simulation-types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const EVENT_OF_ACTION: Record<InteractionAction, AgentEventType> = {
  first_meet: "first_met",
  chat: "chatted",
  hobby_talk: "hobby_talk",
  consult: "consulted",
  invite_date: "went_on_date",
  hint_affection: "hinted",
  flirt: "flirted",
  keep_distance: "kept_distance",
  make_up: "made_up",
};

// 連続で会った日数を更新する。その日はじめての交流で日数が伸びたときだけ true を返す
function updateStreak(relationship: SimRelationship, day: number): boolean {
  if (relationship.lastInteractionDay === day) return false;
  relationship.interactionStreak =
    relationship.lastInteractionDay === day - 1 ? relationship.interactionStreak + 1 : 1;
  relationship.lastInteractionDay = day;
  return true;
}

// 一方向分の数値更新。self から other への感情が、この交流でどう動くか。
function updateDirection(
  world: WorldContext,
  relationship: SimRelationship,
  self: SimAgent,
  other: SimAgent,
  action: InteractionAction,
  outcome: InteractionOutcome,
  isInitiator: boolean,
): void {
  const romantic = canBeRomantic(self, other);
  const prefMatch = computePreferenceMatch(self, other);
  const compat = computeCompatibility(self, other);
  const level = outcome === "great" ? 2 : outcome === "good" ? 1 : 0;

  if (action === "keep_distance") {
    relationship.conflict = clamp(relationship.conflict - 6);
    relationship.attachment = clamp(relationship.attachment - 3);
    return;
  }
  if (action === "make_up") {
    relationship.conflict = clamp(relationship.conflict - (level > 0 ? 20 : -5));
    relationship.trust = clamp(relationship.trust + (level > 0 ? 5 : -3));
    return;
  }

  relationship.familiarity = clamp(
    relationship.familiarity + [2, 4, 6][level]! + (action === "first_meet" ? 3 : 0),
  );
  relationship.trust = clamp(
    relationship.trust + [-2, 2, 4][level]! + (action === "consult" && level > 0 ? 3 : 0),
  );
  relationship.chemistry = clamp(
    relationship.chemistry + (compat * 100 - relationship.chemistry) * 0.15 + (level === 2 ? 3 : 0),
  );
  relationship.conflict = clamp(relationship.conflict + [6, -1, -2][level]!);

  if (!romantic) return;
  // サクラ同士の恋はゆっくり進める。実ユーザーが関わる関係は主人公として早めに動く
  const pace = self.isSakura && other.isSakura ? 0.55 : 1;

  // 第一印象。初対面では見た目と好みの一致で、ある程度の好意が生まれる
  if (action === "first_meet") {
    relationship.attraction = clamp(
      relationship.attraction + 8 + 22 * prefMatch * other.appearance + world.rng.next() * 10,
    );
  }
  const drive = 0.4 + self.romance.romanticDrive;
  let gain = drive * (0.3 + prefMatch) * [-2, 7, 12][level]!;
  const isAffection = action === "invite_date" || action === "hint_affection" || action === "flirt";
  if (isAffection && !isInitiator) {
    // 好意を向けられた側。もともと気になっていれば一気に進み、そうでなければ少し引く
    gain = relationship.attraction >= 30 ? gain * 1.6 : prefMatch > 0.5 ? gain : -2;
  }
  if (action === "invite_date" && level === 2) gain += 5;
  relationship.attraction = clamp(relationship.attraction + (gain > 0 ? gain * pace : gain));

  if (relationship.attraction >= 40) {
    const isPartner = relationship.state === "dating" || relationship.state === "partner";
    relationship.attachment = clamp(
      relationship.attachment +
        (relationship.attraction / 15) * (level === 2 ? 1.5 : 1) * pace +
        (isPartner ? 3 : 0),
    );
  }
}

// 恋人がいるのに別の相手と親密にしたとき、恋人の側に嫉妬が生まれる
function applyJealousy(
  world: WorldContext,
  agent: SimAgent,
  other: SimAgent,
  action: InteractionAction,
  outcome: InteractionOutcome,
  minuteOfDay: number,
): void {
  const partnerId = world.store.partnerOf(agent.id);
  if (!partnerId || partnerId === other.id) return;
  const toOther = world.store.get(agent.id, other.id);
  const suspicious =
    action === "flirt" ||
    action === "hint_affection" ||
    ((toOther?.attraction ?? 0) >= 60 && outcome === "great");
  if (!suspicious) return;
  const partner = world.agents.get(partnerId);
  const partnerToAgent = world.store.get(partnerId, agent.id);
  if (!partner || !partnerToAgent) return;

  const before = partnerToAgent.jealousy;
  partnerToAgent.jealousy = clamp(
    before + partner.romance.jealousy * 25 * (0.5 + world.rng.next() * 0.5),
  );
  partnerToAgent.conflict = clamp(partnerToAgent.conflict + 8);
  partnerToAgent.trust = clamp(partnerToAgent.trust - 5);
  world.store.markTouched(partnerToAgent);
  if (before < 40 && partnerToAgent.jealousy >= 40) {
    world.events.push({
      day: world.day,
      minuteOfDay: Math.min(1439, minuteOfDay + 30),
      type: "jealous",
      actorAgentId: partnerId,
      targetAgentId: agent.id,
      importance: 2,
      payload: { thirdAgentId: other.id },
    });
  }
}

// Relationship Engine（要件定義 10.5）。交流の結果を判定し、双方向の関係値を更新してイベントを残す。
export function applyInteraction(
  world: WorldContext,
  agent: SimAgent,
  other: SimAgent,
  action: InteractionAction,
  minuteOfDay: number,
): InteractionOutcome {
  const { store, day, rng } = world;
  const forward = store.getOrCreate(agent.id, other.id, day);
  const backward = store.getOrCreate(other.id, agent.id, day);
  const isPartner = store.partnerOf(agent.id) === other.id;

  const quality =
    0.35 * computeCompatibility(agent, other) +
    0.15 * computeCompatibility(other, agent) +
    0.2 * (forward.chemistry / 100) +
    0.35 * rng.next() -
    (forward.conflict + backward.conflict) / 500 +
    (action === "invite_date" || action === "hint_affection" ? backward.attraction / 400 : 0);
  const outcome: InteractionOutcome =
    quality >= 0.6 ? "great" : quality >= 0.38 ? "good" : "awkward";

  updateDirection(world, forward, agent, other, action, outcome, true);
  updateDirection(world, backward, other, agent, action, outcome, false);
  if (isPartner && outcome === "awkward") {
    forward.conflict = clamp(forward.conflict + 10);
    backward.conflict = clamp(backward.conflict + 10);
  }
  const streakGrew = updateStreak(forward, day);
  updateStreak(backward, day);
  store.markTouched(forward);
  store.markTouched(backward);
  world.dailyInteractions.set(agent.id, (world.dailyInteractions.get(agent.id) ?? 0) + 1);
  world.dailyInteractions.set(other.id, (world.dailyInteractions.get(other.id) ?? 0) + 1);

  let type = EVENT_OF_ACTION[action];
  if (outcome === "awkward" && action !== "first_meet" && action !== "keep_distance") {
    type = isPartner ? "argued" : action === "make_up" ? "argued" : "awkward";
  }
  const hobby = agent.hobbies.filter((h) => other.hobbies.includes(h));
  world.events.push({
    day,
    minuteOfDay,
    type,
    actorAgentId: agent.id,
    targetAgentId: other.id,
    importance: type === "argued" || type === "went_on_date" || type === "flirted" ? 1 : 0,
    payload: type === "hobby_talk" && hobby.length > 0 ? { hobby: rng.pick(hobby) } : {},
  });
  if (streakGrew && (forward.interactionStreak === 3 || forward.interactionStreak === 7)) {
    world.events.push({
      day,
      minuteOfDay,
      type: "streak",
      actorAgentId: agent.id,
      targetAgentId: other.id,
      importance: 1,
      payload: { streakDays: forward.interactionStreak },
    });
  }

  applyJealousy(world, agent, other, action, outcome, minuteOfDay);
  resolveStateTransition(world, forward, minuteOfDay);
  resolveStateTransition(world, backward, minuteOfDay);
  return outcome;
}
