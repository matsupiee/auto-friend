import { canBeRomantic } from "../agent/can-be-romantic";
import { computeCompatibility } from "../agent/compute-compatibility";
import type { SimAgent, SimEvent, WorldContext } from "./simulation-types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const COOLDOWN_DAYS = 5;

function emit(
  world: WorldContext,
  minuteOfDay: number,
  type: SimEvent["type"],
  actorAgentId: string,
  targetAgentId: string,
  importance: number,
  payload: SimEvent["payload"] = {},
) {
  world.events.push({
    day: world.day,
    minuteOfDay,
    type,
    actorAgentId,
    targetAgentId,
    importance,
    payload,
  });
}

function breakUp(
  world: WorldContext,
  agent: SimAgent,
  partnerId: string,
  minute: number,
  thirdAgentId?: string,
) {
  const { store, day } = world;
  for (const [a, b] of [
    [agent.id, partnerId],
    [partnerId, agent.id],
  ] as const) {
    const relationship = store.get(a, b);
    if (!relationship) continue;
    store.setState(relationship, "ex", day);
    relationship.cooldownUntilDay = day + COOLDOWN_DAYS;
    relationship.attachment = clamp(relationship.attachment - 20);
  }
  emit(world, minute, "broke_up", agent.id, partnerId, 2, thirdAgentId ? { thirdAgentId } : {});
}

// 交際から一定期間が経ち、信頼が十分なら恋人になる
function promoteDating(world: WorldContext, agent: SimAgent, minute: number) {
  const { store, day } = world;
  const partnerId = store.partnerOf(agent.id);
  if (!partnerId || agent.id > partnerId) return; // ペアにつき1回だけ判定する
  const forward = store.get(agent.id, partnerId);
  const backward = store.get(partnerId, agent.id);
  if (!forward || !backward || forward.state !== "dating" || backward.state !== "dating") return;
  if (day - forward.stateChangedDay < 4 || forward.trust < 50 || backward.trust < 50) return;
  store.setState(forward, "partner", day);
  store.setState(backward, "partner", day);
  emit(world, minute, "became_partners", agent.id, partnerId, 2);
}

// 恋人同士にも、ときどきすれ違いが起きる
function maybeDrift(world: WorldContext, agent: SimAgent, minute: number) {
  const { store, rng } = world;
  const partnerId = store.partnerOf(agent.id);
  if (!partnerId || agent.id > partnerId || !rng.chance(0.03)) return;
  for (const [a, b] of [
    [agent.id, partnerId],
    [partnerId, agent.id],
  ] as const) {
    const relationship = store.get(a, b);
    if (!relationship) continue;
    relationship.conflict = clamp(relationship.conflict + 30);
    relationship.trust = clamp(relationship.trust - 10);
    store.markTouched(relationship);
  }
  emit(world, minute, "argued", agent.id, partnerId, 1);
}

// 関係がこじれた恋人同士は、話し合うか、距離を置くか、別れるかを選ぶ（要件定義 13）
function considerBreakUp(world: WorldContext, agent: SimAgent, minute: number) {
  const { store, rng } = world;
  const partnerId = store.partnerOf(agent.id);
  if (!partnerId) return;
  const toPartner = store.get(agent.id, partnerId);
  if (!toPartner) return;
  const troubled = toPartner.trust <= 30 || toPartner.conflict >= 75 || toPartner.attraction <= 20;
  if (!troubled) return;

  const p = agent.personality;
  const r = agent.romance;
  const choice = rng.weighted(
    ["continue", "talk", "take_distance", "break_up"] as const,
    (option) => {
      switch (option) {
        case "continue":
          return r.commitment;
        case "talk":
          return (p.agreeableness + r.forgiveness) / 2;
        case "take_distance":
          return (1 - p.extroversion) * 0.6;
        case "break_up":
          return (
            (1 - r.forgiveness + (1 - r.commitment)) / 2 + (toPartner.conflict >= 75 ? 0.4 : 0)
          );
      }
    },
  );
  if (choice === "break_up") {
    breakUp(world, agent, partnerId, minute);
  } else if (choice === "talk") {
    for (const [a, b] of [
      [agent.id, partnerId],
      [partnerId, agent.id],
    ] as const) {
      const relationship = store.get(a, b);
      if (!relationship) continue;
      relationship.conflict = clamp(relationship.conflict - 15);
      relationship.trust = clamp(relationship.trust + 5);
      store.markTouched(relationship);
    }
    emit(world, minute, "made_up", agent.id, partnerId, 1);
  } else if (choice === "take_distance") {
    emit(world, minute, "kept_distance", agent.id, partnerId, 1);
  }
}

// 恋人がいるのに別の相手を強く好きになったとき（要件定義 14）
function considerTemptation(world: WorldContext, agent: SimAgent, minute: number) {
  const { store, rng } = world;
  const partnerId = store.partnerOf(agent.id);
  if (!partnerId || agent.romance.loyalty > 0.5 || !rng.chance(0.3)) return;
  const temptation = store
    .outgoing(agent.id)
    .filter((r) => r.targetAgentId !== partnerId && r.state === "crush" && r.attraction >= 70)
    .sort((a, b) => b.attraction - a.attraction)[0];
  if (!temptation) return;

  const p = agent.personality;
  const r = agent.romance;
  const choice = rng.weighted(
    ["suppress_feelings", "stay_friends", "tell_partner", "break_up_first"] as const,
    (option) => {
      switch (option) {
        case "suppress_feelings":
          return r.loyalty + r.commitment;
        case "stay_friends":
          return p.agreeableness * 0.6;
        case "tell_partner":
          return p.conscientiousness * 0.3;
        case "break_up_first":
          return p.impulsiveness * (1 - r.commitment) * 1.2;
      }
    },
  );
  if (choice === "break_up_first") {
    breakUp(world, agent, partnerId, minute, temptation.targetAgentId);
  } else if (choice === "suppress_feelings" || choice === "stay_friends") {
    temptation.attraction = clamp(temptation.attraction - 5);
    store.markTouched(temptation);
  } else if (choice === "tell_partner") {
    const partnerToAgent = store.get(partnerId, agent.id);
    if (partnerToAgent) {
      partnerToAgent.trust = clamp(partnerToAgent.trust - 10);
      partnerToAgent.conflict = clamp(partnerToAgent.conflict + 15);
      store.markTouched(partnerToAgent);
    }
  }
}

// 片思いの相手に告白するかを決め、告白された側が返事をする（要件定義 12）
function considerConfession(world: WorldContext, agent: SimAgent, minute: number) {
  const { store, rng, day } = world;
  if (store.partnerOf(agent.id)) return;
  const crush = store
    .outgoing(agent.id)
    .filter(
      (r) =>
        r.state === "crush" &&
        r.attraction >= 70 &&
        r.attachment >= 45 &&
        r.familiarity >= 45 &&
        (r.cooldownUntilDay === null || r.cooldownUntilDay < day),
    )
    .sort((a, b) => b.attraction - a.attraction)[0];
  if (!crush) return;
  const target = world.agents.get(crush.targetAgentId);
  if (!target) return;

  const p = agent.personality;
  const r = agent.romance;
  const targetTaken = store.partnerOf(target.id) !== undefined;
  const choice = rng.weighted(["confess", "hint", "wait", "give_up"] as const, (option) => {
    switch (option) {
      case "confess":
        return (
          (r.initiative * 0.8 + p.confidence * 0.6 + (crush.attraction - 70) / 30) *
          (targetTaken ? 0.3 : 1)
        );
      case "hint":
        return 0.4 + r.flirtiness * 0.3;
      case "wait":
        return 0.6 + r.sensitivity * 0.4;
      case "give_up":
        return targetTaken ? 0.6 : 0.05;
    }
  });

  if (choice === "hint") {
    const back = store.getOrCreate(target.id, agent.id, day);
    back.attraction = clamp(back.attraction + 3);
    store.markTouched(back);
    emit(world, minute, "hinted", agent.id, target.id, 0);
    return;
  }
  if (choice === "give_up") {
    crush.attraction = clamp(crush.attraction - 15);
    store.setState(crush, "interested", day);
    emit(world, minute, "gave_up", agent.id, target.id, 1);
    return;
  }
  if (choice !== "confess") return;

  emit(world, minute, "confessed", agent.id, target.id, 2);
  const back = store.getOrCreate(target.id, agent.id, day);
  const answerMinute = Math.min(1439, minute + rng.int(5, 40));

  const willing = canBeRomantic(target, agent) && !targetTaken;
  const acceptProbability = willing
    ? 1 / (1 + Math.exp(-(back.attraction - 50) / 8)) +
      (computeCompatibility(target, agent) - 0.5) * 0.3
    : 0;
  if (willing && back.attraction >= 40 && back.attraction < 55 && rng.chance(0.35)) {
    back.attraction = clamp(back.attraction + 5);
    store.markTouched(back);
    emit(world, answerMinute, "asked_for_time", target.id, agent.id, 2);
    return;
  }
  if (rng.chance(acceptProbability)) {
    store.setState(crush, "dating", day);
    store.setState(back, "dating", day);
    back.attraction = clamp(back.attraction + 10);
    emit(world, answerMinute, "confession_accepted", target.id, agent.id, 2);
    return;
  }
  crush.attraction = clamp(crush.attraction - 20);
  crush.attachment = clamp(crush.attachment - 15);
  crush.conflict = clamp(crush.conflict + 5);
  crush.cooldownUntilDay = day + COOLDOWN_DAYS;
  store.setState(crush, "friend", day);
  emit(world, answerMinute, "confession_rejected", target.id, agent.id, 2);
}

// 1日の終わりに、恋愛の大きな判断（昇格・別れ・誘惑・告白）をまとめて行う。
export function runRomanceDecisions(world: WorldContext): void {
  for (const agent of world.rng.shuffle([...world.agents.values()])) {
    const minute = world.rng.int(20 * 60, 23 * 60 + 50);
    promoteDating(world, agent, minute);
    maybeDrift(world, agent, minute);
    considerBreakUp(world, agent, minute);
    considerTemptation(world, agent, minute);
    considerConfession(world, agent, minute);
  }
}
