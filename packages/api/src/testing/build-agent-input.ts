import { onboardingQuestions } from "../shared/agent/onboarding-questions";

// agent.create に渡す、正しい入力の例。テストごとに一部だけ上書きして使う。
export function buildAgentInput() {
  return {
    displayName: "テスト太郎",
    gender: "male" as const,
    romanticPreference: ["female" as const],
    birthDate: "2000-01-01",
    birthplace: "東京都" as const,
    schoolType: "共学の公立高校" as const,
    club: "軽音部" as const,
    circle: "写真サークル" as const,
    hobbies: ["カフェ巡り" as const, "映画" as const, "写真" as const],
    answers: Object.fromEntries(onboardingQuestions.map((q) => [q.id, q.options[0]?.id ?? ""])),
  };
}
