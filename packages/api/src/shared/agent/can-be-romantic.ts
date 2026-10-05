import type { SimAgent } from "../simulation/simulation-types";

// viewer の恋愛対象に target の性別が含まれているか。友情はこの判定に関係なく育つ。
export function canBeRomantic(viewer: SimAgent, target: SimAgent): boolean {
  return viewer.romanticPreference.includes(target.gender);
}
