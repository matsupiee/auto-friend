import type { Rng } from "./create-rng";
import type { SimAgent } from "./simulation-types";

// その日に届けるいいねの数。要件定義 1.2 の「たくさんもらえる日があったりなかったりする」を作る。
// 実ユーザーのエージェントは離脱しない程度に下限を持たせ、ときどき大きく伸びる日を混ぜる。
export function decideDailyLikeCount(agent: SimAgent, rng: Rng): number {
  if (!agent.isSakura) {
    const roll = rng.next();
    if (roll < 0.25) return rng.int(6, 12);
    if (roll < 0.35) return rng.int(0, 1);
    return rng.int(1, 4);
  }
  const roll = rng.next();
  if (roll < 0.05) return rng.int(4, 6);
  if (roll < 0.3) return rng.int(2, 3);
  return rng.int(0, 1);
}
