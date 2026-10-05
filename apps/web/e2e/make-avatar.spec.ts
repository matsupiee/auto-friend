import { expect, test } from "@playwright/test";

import { createAgent, signIn, signUp } from "./helpers";

// docs/user-stories/make-avatar.md
test("作成画面でパーツを組み合わせて見た目を作り、あとから作り直せる", async ({ page }) => {
  await signUp(page);
  await page.getByLabel("エージェントの名前").fill("アオイ");
  await page.getByRole("button", { name: "女性" }).first().click();
  await page.getByRole("button", { name: "男性" }).nth(1).click();
  await page.getByLabel("生年月日").fill("2000-05-05");
  await page.getByRole("button", { name: "次へ" }).click();

  // 性別に合わせたおまかせの見た目から始まる
  const preview = page.getByTestId("avatar-preview");
  await expect(preview.getByRole("img", { name: "アバターのプレビュー" })).toBeVisible();

  // パーツを選ぶと、選んだものだけが選択中になる
  await page.getByRole("tab", { name: "髪型" }).click();
  await page.getByRole("button", { name: "髪型: ツインテール" }).click();
  await expect(page.getByRole("button", { name: "髪型: ツインテール" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "髪の色: ピンク" }).click();
  await page.getByRole("tab", { name: "目" }).click();
  await page.getByRole("button", { name: "目: ぱっちり" }).click();
  await page.getByLabel("目の大きさ").fill("3");
  await expect(page.getByLabel("目の大きさ")).toHaveValue("3");
  await page.getByRole("tab", { name: "体格" }).click();
  await page.getByLabel("身長").fill("80");
  await page.getByRole("tab", { name: "好きな色" }).click();
  await page.getByRole("button", { name: "好きな色: 紫" }).click();

  // おまかせで丸ごと作り直せる
  const before = await preview.innerHTML();
  await page.getByRole("button", { name: "おまかせ" }).click();
  await expect.poll(() => preview.innerHTML()).not.toBe(before);
  await page.getByRole("tab", { name: "髪型" }).click();
  await page.getByRole("button", { name: "髪型: ツインテール" }).click();

  // 残りの手順を進めて作成する（見た目のステップはそのまま次へ）
  await page.getByRole("button", { name: "次へ" }).click();
  await page.getByLabel("出身").selectOption("東京都");
  await page.getByLabel("通っていた学校").selectOption("共学の公立高校");
  await page.getByLabel("部活").selectOption("軽音部");
  await page.getByLabel("サークル").selectOption("写真サークル");
  for (const hobby of ["カフェ巡り", "映画", "写真"]) {
    await page.getByRole("button", { name: hobby, exact: true }).click();
  }
  await page.getByRole("button", { name: "次へ" }).click();
  const questions = page.locator("main section");
  const count = await questions.count();
  for (let i = 0; i < count; i++) await questions.nth(i).locator("button").first().click();
  await page.getByRole("button", { name: "この子を世界に送り出す" }).click();
  await page.waitForURL("**/home**");

  // プロフィールでは全身で表示され、自分のエージェントなら見た目を編集できる
  await page.getByRole("link", { name: "プロフィールを見る" }).click();
  await expect(page.getByRole("img", { name: "アオイの見た目" })).toBeVisible();
  await page.getByRole("link", { name: "見た目を編集" }).click();
  await page.waitForURL("**/avatar");

  // 作成時に選んだパーツが引き継がれている
  await page.getByRole("tab", { name: "髪型" }).click();
  await expect(page.getByRole("button", { name: "髪型: ツインテール" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // 変更がないうちは保存できず、変えると保存できる
  await expect(page.getByRole("button", { name: "この見た目で保存" })).toBeDisabled();
  await page.getByRole("button", { name: "髪型: おだんご" }).click();
  await page.getByRole("button", { name: "元に戻す" }).click();
  await expect(page.getByRole("button", { name: "髪型: ツインテール" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "髪型: おだんご" }).click();
  await page.getByRole("button", { name: "この見た目で保存" }).click();
  await page.waitForURL("**/agents/**");
  await expect(page.getByText("見た目を保存しました")).toBeVisible();

  // もう一度開くと、保存した見た目になっている
  await page.goto("/avatar");
  await page.getByRole("tab", { name: "髪型" }).click();
  await expect(page.getByRole("button", { name: "髪型: おだんご" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("他人のエージェントのプロフィールには、見た目の編集ボタンが出ない", async ({ page }) => {
  await signUp(page);
  await createAgent(page);
  await page.goto("/relationships");
  await page.getByTestId("group-acquaintance").getByRole("link").first().click();
  await page.waitForURL("**/agents/**");
  await expect(page.getByRole("img", { name: /の見た目$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "見た目を編集" })).toHaveCount(0);
});

test("デモユーザーは seed で用意した見た目で表示される", async ({ page }) => {
  await signIn(page, "demo@auto-friend.test");
  await page.getByRole("link", { name: "プロフィールを見る" }).click();
  await expect(page.getByRole("img", { name: "ハルの見た目" })).toBeVisible();
});
