import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

// docs/user-stories/agent-detail.md
test("自分のエージェントは、性格と恋愛傾向まで見られる", async ({ page }) => {
  await signIn(page, "demo@auto-friend.test");
  await page.locator("main a").first().click();
  await expect(page.getByText("あなたのエージェント", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "性格" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "恋愛傾向" })).toBeVisible();
  await expect(page.getByText(/最近の気分/)).toBeVisible();
});

test("他人のエージェントは、恋愛傾向が見えず、自分との関係が見える", async ({ page }) => {
  await signIn(page, "demo@auto-friend.test");
  await page.getByRole("link", { name: "関係" }).click();
  await page.getByTestId("group-crush").locator("a").first().click();
  await expect(page.getByText(/あなたのエージェントとは/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "性格" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "恋愛傾向" })).toHaveCount(0);
});
