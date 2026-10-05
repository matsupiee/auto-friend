import { expect, test } from "@playwright/test";

import { createAgent, signUp } from "./helpers";

// docs/user-stories/advance-world-day.md
test("次の日へ進めると、日付が1日進み、新しい日の出来事が並ぶ", async ({ page }) => {
  await signUp(page);
  await createAgent(page);
  const before = await page.getByText(/世界の\d+日目/).textContent();
  const day = Number(before?.match(/世界の(\d+)日目/)?.[1]);

  await page.getByRole("button", { name: /次の日へ進める/ }).click();
  await expect(page.getByText(`${day + 1}日目になりました`)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(`世界の${day + 1}日目`)).toBeVisible();
  await expect(page.getByRole("button", { name: "今日" })).toBeVisible();
  await expect(page.getByRole("button", { name: `${day}日目` })).toBeVisible();
  await expect(page.getByTestId("diary")).not.toBeEmpty();
});
