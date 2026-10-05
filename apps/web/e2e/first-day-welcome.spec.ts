import { expect, test } from "@playwright/test";

import { createAgent, signUp } from "./helpers";

// docs/user-stories/first-day-welcome.md
test("参加した初日に、いいねが8件以上と、3人以上との出会いが届く", async ({ page }) => {
  await signUp(page);
  await createAgent(page);

  const likes = Number((await page.getByTestId("today-likes").textContent())?.replace(/\D/g, ""));
  expect(likes).toBeGreaterThanOrEqual(8);
  await expect(
    page
      .getByTestId("timeline")
      .getByText(/と知り合いました/)
      .first(),
  ).toBeVisible();
  expect(
    await page
      .getByTestId("timeline")
      .getByText(/と知り合いました/)
      .count(),
  ).toBeGreaterThanOrEqual(3);
  await expect(page.getByTestId("diary")).toContainText("いいね");
});
