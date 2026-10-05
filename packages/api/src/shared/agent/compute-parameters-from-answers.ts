import {
  personalityKeys,
  preferenceKeys,
  romanceKeys,
} from "@auto-friend/db/constants/agent-parameters";
import type { Personality, Preference, Romance } from "@auto-friend/db/constants/agent-parameters";

import { onboardingQuestions } from "./onboarding-questions";

const clamp = (value: number) => Math.round(Math.max(0.05, Math.min(0.95, value)) * 100) / 100;

// 10問の回答（questionId → optionId）から、性格・恋愛・好みパラメータを組み立てる。
// 未回答や存在しない選択肢がある場合は null を返す。
export function computeParametersFromAnswers(
  answers: Record<string, string>,
): { personality: Personality; romance: Romance; preference: Preference } | null {
  const personality = Object.fromEntries(personalityKeys.map((key) => [key, 0.5])) as Personality;
  const romance = Object.fromEntries(romanceKeys.map((key) => [key, 0.5])) as Romance;
  const preference = Object.fromEntries(preferenceKeys.map((key) => [key, 0.4])) as Preference;

  for (const question of onboardingQuestions) {
    const option = question.options.find((o) => o.id === answers[question.id]);
    if (!option) return null;
    for (const [key, value] of Object.entries(option.delta.personality ?? {})) {
      personality[key as keyof Personality] += value;
    }
    for (const [key, value] of Object.entries(option.delta.romance ?? {})) {
      romance[key as keyof Romance] += value;
    }
    for (const [key, value] of Object.entries(option.delta.preference ?? {})) {
      preference[key as keyof Preference] += value;
    }
  }

  for (const key of personalityKeys) personality[key] = clamp(personality[key]);
  for (const key of romanceKeys) romance[key] = clamp(romance[key]);
  for (const key of preferenceKeys) preference[key] = clamp(preference[key]);
  return { personality, romance, preference };
}
