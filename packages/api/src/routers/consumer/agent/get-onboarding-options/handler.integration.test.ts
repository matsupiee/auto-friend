import { describe, expect, test } from "bun:test";

import { handler } from "./handler";

describe("agent.getOnboardingOptions", () => {
  test("10問の質問と、プロフィールの選択肢を返す。パラメータへの影響は返さない", async () => {
    const result = await handler();

    expect(result.questions).toHaveLength(10);
    expect(result.questions[0]?.options).toHaveLength(4);
    expect(JSON.stringify(result)).not.toContain("delta");
    expect(result.prefectures).toContain("東京都");
    expect(result.hobbies.length).toBeGreaterThanOrEqual(20);
  });
});
