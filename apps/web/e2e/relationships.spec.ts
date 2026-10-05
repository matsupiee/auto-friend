import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

// docs/user-stories/relationships.md
test("関係の深さごとに、知っている相手が並ぶ", async ({ page }) => {
  await signIn(page, "demo@auto-friend.test");
  await page.getByRole("link", { name: "関係" }).click();
  await expect(page.getByRole("heading", { name: "関係" })).toBeVisible();

  await expect(page.getByRole("heading", { name: /💗 片思い/ })).toBeVisible();
  await expect(page.getByTestId("group-crush")).toContainText("3日連続");
  await expect(page.getByTestId("group-friend")).toBeVisible();
  await expect(page.getByTestId("admirers")).toBeVisible();
});

test("交際中の相手は、恋人・交際中のグループに出る", async ({ page }) => {
  await signIn(page, "couple@auto-friend.test");
  await page.getByRole("link", { name: "関係" }).click();
  await expect(page.getByTestId("group-partner")).toContainText("交際中");
});
