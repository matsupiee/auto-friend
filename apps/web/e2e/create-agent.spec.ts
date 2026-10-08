import { expect, test } from "@playwright/test";

import { createAgent, signUp } from "./helpers";

// docs/user-stories/create-agent.md
test("登録してエージェントを作ると、ホームに出来事が並ぶ", async ({ page }) => {
  await signUp(page);
  await expect(page.getByRole("button", { name: "次へ" })).toBeDisabled();
  await createAgent(page);

  await expect(page.getByRole("heading", { name: "ハルキの毎日" })).toBeVisible();

  // 作成済みならオンボーディングには戻らない
  await page.goto("/onboarding");
  await page.waitForURL("**/home**");
});

test("エージェント未作成のままホームを開くと、作成画面に送られる", async ({ page }) => {
  await signUp(page);
  await page.goto("/home");
  await page.waitForURL("**/onboarding");
});
