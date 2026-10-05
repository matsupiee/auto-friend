import { computeCompatibility } from "../agent/compute-compatibility";
import type { Candidate, SimAgent, WorldContext } from "./simulation-types";

const MAX_CANDIDATES = 5;

// Candidate Engine（要件定義 10.2）。交流相手の候補を最大5人まで出す。
export function selectCandidates(world: WorldContext, agent: SimAgent): Candidate[] {
  const { store, rng, day } = world;
  const candidates: Candidate[] = [];
  const seen = new Set<string>([agent.id]);
  const push = (agentId: string, kind: Candidate["kind"]) => {
    if (seen.has(agentId) || candidates.length >= MAX_CANDIDATES) return;
    seen.add(agentId);
    candidates.push({ agentId, kind });
  };

  const partnerId = store.partnerOf(agent.id);
  if (partnerId) push(partnerId, "partner");

  const outgoing = store
    .outgoing(agent.id)
    .filter((r) => r.cooldownUntilDay === null || r.cooldownUntilDay < day);

  const romantic = outgoing
    .filter((r) => r.state === "crush" || r.state === "interested")
    .sort((a, b) => b.attraction - a.attraction)
    .slice(0, 2);
  for (const r of romantic) push(r.targetAgentId, r.state === "crush" ? "crush" : "interested");

  // いちばん気の合う友人・知り合いは、毎日のように顔を合わせる
  const friends = outgoing.filter((r) => r.state === "friend" || r.state === "acquaintance");
  const closest = [...friends].sort(
    (a, b) => b.attraction + b.chemistry - (a.attraction + a.chemistry),
  )[0];
  if (closest) push(closest.targetAgentId, closest.state === "friend" ? "friend" : "acquaintance");

  // しばらく会っていない友人ほど選ばれやすくする
  const friendPick = rng.weighted(
    friends,
    (r) => 1 + r.familiarity / 40 + (day - (r.lastInteractionDay ?? day - 3)) * 0.3,
  );
  if (friendPick)
    push(friendPick.targetAgentId, friendPick.state === "friend" ? "friend" : "acquaintance");

  // いいねをくれた・いいねした相手で、まだ会っていない人
  const admirers = outgoing.filter((r) => {
    if (r.state !== "stranger") return false;
    return (store.get(r.targetAgentId, agent.id)?.likedDay ?? null) !== null || r.likedDay !== null;
  });
  if (admirers.length > 0) push(rng.pick(admirers).targetAgentId, "admirer");

  // 新規接触枠。ランダムに眺めた中から相性の良い相手を選ぶ。知り合いが多いほど新しい出会いは減る
  if (friends.length >= 12 && rng.chance(0.6)) return candidates;
  const all = [...world.agents.values()];
  let best: { id: string; score: number } | undefined;
  for (let i = 0; i < 10; i++) {
    const other = rng.pick(all);
    if (seen.has(other.id) || store.get(agent.id, other.id)) continue;
    const score = computeCompatibility(agent, other) + rng.next() * 0.2;
    if (!best || score > best.score) best = { id: other.id, score };
  }
  if (best) push(best.id, "new");

  return candidates;
}
