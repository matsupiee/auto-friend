import { defineConfig } from "@playwright/test";

// ユーザーストーリーの動作確認用 E2E テスト。
// 事前に `bun run db:seed` で世界を作り直してから実行する（docs/user-stories を参照）。
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3001",
    viewport: { width: 420, height: 900 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  // 世界の日付を進めるテスト（*.mutating.spec.ts）は、seed の状態を前提にするテストのあとに流す
  projects: [
    { name: "stories", testIgnore: /\.mutating\.spec\.ts$/ },
    { name: "mutating", testMatch: /\.mutating\.spec\.ts$/, dependencies: ["stories"] },
  ],
  webServer: [
    {
      command: "bun run dev",
      cwd: "../server",
      url: "http://localhost:3000",
      reuseExistingServer: true,
    },
    { command: "bun run dev", url: "http://localhost:3001", reuseExistingServer: true },
  ],
});
