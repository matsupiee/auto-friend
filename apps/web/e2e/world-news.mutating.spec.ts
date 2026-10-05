import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

// docs/user-stories/romance-drama.md
test("片思い中のまま日を進めると、世界のニュースに恋愛の出来事が流れる", async ({ page }) => {
  await signIn(page, "demo@auto-friend.test");
  await page.getByRole("button", { name: /次の日へ進める/ }).click();
  await expect(page.getByText(/日目になりました/)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("世界のようす")).toBeVisible();
  await expect(
    page
      .getByText(/告白しました|付き合い始めました|別れました|届きませんでした|恋人になりました/)
      .first(),
  ).toBeVisible();
});
