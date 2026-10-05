import { personalityKeys, preferenceKeys } from "@auto-friend/db/constants/agent-parameters";

import type { SimAgent } from "../simulation/simulation-types";
import { computePreferenceMatch } from "./compute-preference-match";

function pairSeed(a: string, b: string): number {
  const key = a < b ? `${a}:${b}` : `${b}:${a}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function sharedInterests(a: SimAgent, b: SimAgent): number {
  const common = a.hobbies.filter((hobby) => b.hobbies.includes(hobby)).length;
  const base = common / Math.max(1, Math.min(a.hobbies.length, b.hobbies.length));
  let background = 0;
  if (a.birthplace === b.birthplace) background += 0.15;
  if (a.club === b.club && a.club !== "帰宅部") background += 0.1;
  if (a.circle === b.circle && a.circle !== "入っていない") background += 0.1;
  return Math.min(1, base + background);
}

// 要件定義 9.1 の相性スコア（0〜1）。viewer から見た target への相性で、向きによって値が違う。
// randomness はペアごとに固定の値を使い、「なぜか馬が合う」を表現する。
export function computeCompatibility(viewer: SimAgent, target: SimAgent): number {
  const personalityDiff =
    personalityKeys.reduce(
      (sum, key) => sum + Math.abs(viewer.personality[key] - target.personality[key]),
      0,
    ) / personalityKeys.length;
  const valuesDiff =
    preferenceKeys.reduce(
      (sum, key) => sum + Math.abs(viewer.preference[key] - target.preference[key]),
      0,
    ) / preferenceKeys.length;

  return (
    (1 - personalityDiff) * 0.25 +
    computePreferenceMatch(viewer, target) * 0.25 +
    sharedInterests(viewer, target) * 0.2 +
    (1 - valuesDiff) * 0.2 +
    pairSeed(viewer.id, target.id) * 0.1
  );
}
