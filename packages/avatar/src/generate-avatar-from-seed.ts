import type { Avatar } from "./avatar-schema";
import { generateRandomAvatar } from "./generate-random-avatar";

// 文字列（エージェントの id など）から、毎回同じアバターを作る。
// アバターをまだ持っていないエージェントの見た目を、表示のたびに変えないために使う。
export function generateAvatarFromSeed(seed: string, gender?: "male" | "female" | "other"): Avatar {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) state = Math.imul(state ^ seed.charCodeAt(i), 16777619);
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return generateRandomAvatar(random, gender);
}
