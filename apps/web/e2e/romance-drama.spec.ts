import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

// docs/user-stories/romance-drama.md
test("交際中のエージェントには、嫉妬・揉めごと・仲直りが起きる", async ({ page }) => {
  await signIn(page, "couple@auto-friend.test");
  await expect(page.getByText(/交際中/).first()).toBeVisible();
  await expect(page.getByTestId("timeline")).toContainText("嫉妬されたようです");
  await expect(page.getByTestId("timeline")).toContainText("少し揉めたようです");
  await expect(page.getByTestId("timeline")).toContainText("仲直りしました");

  await page.getByRole("button", { name: "2日目" }).click();
  await expect(page.getByTestId("timeline")).toContainText("から告白されました");
  await expect(page.getByTestId("timeline")).toContainText("付き合うことになりました");
});
