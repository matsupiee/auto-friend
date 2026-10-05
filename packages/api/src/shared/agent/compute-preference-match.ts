import { preferenceKeys } from "@auto-friend/db/constants/agent-parameters";
import type { Preference } from "@auto-friend/db/constants/agent-parameters";

import type { SimAgent } from "../simulation/simulation-types";

function traitsOf(agent: SimAgent): Preference {
  const p = agent.personality;
  return {
    humor: p.humor,
    kindness: p.agreeableness,
    ambition: (p.confidence + p.conscientiousness) / 2,
    intelligence: (p.openness + p.conscientiousness) / 2,
    appearance: agent.appearance,
    stability: (p.conscientiousness + (1 - p.emotionality)) / 2,
    adventure: (p.openness + p.impulsiveness) / 2,
    creativity: p.openness,
    sociality: p.extroversion,
  };
}

// viewer が重視するポイントを target がどれだけ満たしているか（0〜1）。
export function computePreferenceMatch(viewer: SimAgent, target: SimAgent): number {
  const traits = traitsOf(target);
  let weighted = 0;
  let totalWeight = 0;
  for (const key of preferenceKeys) {
    const weight = viewer.preference[key];
    weighted += weight * traits[key];
    totalWeight += weight;
  }
  return totalWeight === 0 ? 0.5 : weighted / totalWeight;
}
