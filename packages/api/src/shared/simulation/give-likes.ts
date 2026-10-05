import { canBeRomantic } from "../agent/can-be-romantic";
import { computePreferenceMatch } from "../agent/compute-preference-match";
import type { SimAgent, WorldContext } from "./simulation-types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

// target に count 件のいいねを届ける。いいねする側は、好みに合う相手ほど選ばれやすい。
// いいねされた側のエージェントも、好みに合えば自動でいいねを返し、マッチが生まれる。
export function giveLikes(
  world: WorldContext,
  target: SimAgent,
  count: number,
  minuteRange: { from: number; to: number },
): void {
  const { store, rng, day } = world;
  const all = [...world.agents.values()];
  const likers = new Set<string>();
  for (let attempt = 0; attempt < count * 4 && likers.size < count; attempt++) {
    const pool: SimAgent[] = [];
    for (let i = 0; i < 12; i++) {
      const candidate = rng.pick(all);
      if (candidate.id === target.id || likers.has(candidate.id)) continue;
      if (!canBeRomantic(candidate, target)) continue;
      if ((store.get(candidate.id, target.id)?.likedDay ?? null) !== null) continue;
      pool.push(candidate);
    }
    const liker = rng.weighted(pool, (candidate) => {
      const match = computePreferenceMatch(candidate, target);
      const taken = store.partnerOf(candidate.id) ? 0.2 : 1;
      return match * match * (0.5 + candidate.romance.romanticDrive) * taken;
    });
    if (!liker) continue;
    likers.add(liker.id);

    const minuteOfDay = rng.int(minuteRange.from, minuteRange.to);
    const forward = store.getOrCreate(liker.id, target.id, day);
    forward.likedDay = day;
    forward.attraction = clamp(forward.attraction + 6 + 8 * computePreferenceMatch(liker, target));
    store.markTouched(forward);
    const backward = store.getOrCreate(target.id, liker.id, day);
    world.events.push({
      day,
      minuteOfDay,
      type: "liked",
      actorAgentId: liker.id,
      targetAgentId: target.id,
      importance: 0,
      payload: {},
    });

    const likeBack =
      backward.likedDay === null &&
      canBeRomantic(target, liker) &&
      rng.chance(0.15 + computePreferenceMatch(target, liker) * 0.5 * target.romance.romanticDrive);
    if (backward.likedDay !== null || likeBack) {
      if (likeBack) {
        backward.likedDay = day;
        backward.attraction = clamp(backward.attraction + 5);
        store.markTouched(backward);
        world.events.push({
          day,
          minuteOfDay: Math.min(1439, minuteOfDay + rng.int(1, 30)),
          type: "liked",
          actorAgentId: target.id,
          targetAgentId: liker.id,
          importance: 0,
          payload: {},
        });
      }
      world.events.push({
        day,
        minuteOfDay: Math.min(1439, minuteOfDay + 31),
        type: "matched",
        actorAgentId: liker.id,
        targetAgentId: target.id,
        importance: 1,
        payload: {},
      });
    }
  }
}
