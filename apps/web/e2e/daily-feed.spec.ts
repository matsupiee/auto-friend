import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

// docs/user-stories/daily-feed.md
test("今日と過去の日の出来事・日記を切り替えて見られる", async ({ page }) => {
  await signIn(page, "demo@auto-friend.test");

  await expect(page.getByText("今日、あなたのエージェントに起きたこと")).toBeVisible();
  await expect(page.getByText("大きな出来事")).toBeVisible();
  await expect(page.getByTestId("timeline")).toContainText("のことを好きになったようです");
  await expect(page.getByTestId("timeline")).toContainText(
    "誰かがあなたのエージェントのことを気になり始めたようです",
  );
  await expect(page.getByTestId("diary")).toContainText("好きなんだと思う");

  await page.getByRole("button", { name: "1日目" }).click();
  await expect(page.getByText("1日目に起きたこと")).toBeVisible();
  await expect(page.getByTestId("timeline")).toContainText("とマッチしました");
  await page.getByRole("button", { name: /いいね .* 件をすべて表示/ }).click();
  await expect(page.getByTestId("timeline")).toContainText("からいいねが届きました");
});
