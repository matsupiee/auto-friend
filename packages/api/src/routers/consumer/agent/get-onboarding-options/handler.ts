import {
  circles,
  clubs,
  hobbies,
  prefectures,
  schoolTypes,
} from "@auto-friend/db/constants/profile-options";

import { onboardingQuestions } from "../../../../shared/agent/onboarding-questions";

export async function handler() {
  return {
    prefectures: [...prefectures],
    schoolTypes: [...schoolTypes],
    clubs: [...clubs],
    circles: [...circles],
    hobbies: [...hobbies],
    genders: [
      { value: "male" as const, label: "男性" },
      { value: "female" as const, label: "女性" },
      { value: "other" as const, label: "その他" },
    ],
    // パラメータへの影響（delta）はクライアントに渡さない
    questions: onboardingQuestions.map((question) => ({
      id: question.id,
      text: question.text,
      options: question.options.map((option) => ({ id: option.id, label: option.label })),
    })),
  };
}
