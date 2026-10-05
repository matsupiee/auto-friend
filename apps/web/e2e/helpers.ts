import type { Page } from "@playwright/test";

export const DEMO_PASSWORD = "demo-password";

export async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByRole("button", { name: "アカウントをお持ちの方はログイン" }).click();
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(DEMO_PASSWORD);
  await page.locator("form").getByRole("button", { name: "ログイン" }).click();
  await page.waitForURL("**/home**");
}

export async function signUp(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "エージェントを作ってはじめる" }).click();
  await page.getByLabel("ニックネーム").fill("テスター");
  await page.getByLabel("メールアドレス").fill(`e2e-${Date.now()}@example.test`);
  await page.getByLabel("パスワード").fill("password1234");
  await page.getByRole("button", { name: "はじめる" }).click();
  await page.waitForURL("**/onboarding");
}

export async function createAgent(page: Page, name = "ハルキ") {
  await page.getByLabel("エージェントの名前").fill(name);
  await page.getByRole("button", { name: "男性" }).first().click();
  await page.getByRole("button", { name: "女性" }).nth(1).click();
  await page.getByLabel("生年月日").fill("2000-05-05");
  await page.getByRole("button", { name: "次へ" }).click();
  // 見た目はおまかせで作られた状態のまま進む → docs/user-stories/make-avatar.md
  await page.getByTestId("avatar-preview").waitFor();
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
  await page.getByTestId("timeline").waitFor();
}
