- apps/nativeは開発不要。最初はwebだけで開発とリリース・運用まで完結させる
- 実装後は、必ず ブラウザで動作確認をする
- API側はテストを書く
- docs/user-stories にユーザーストーリーを書いておいてください。1ストーリー1ファイルです。実装が終わったら、全ストーリーについて動作が破綻してないかを確認するテストを行なってください。ストーリーのテストをしやすいようにseedデータ作成コマンドを、packages/db/src/seed/ に作っておいてください。また、requirement.mdも実装が終わるごとに更新・修正してください。
- docs 配下のドキュメントを書くときは docs/rules/document-style.md に従ってください。とくに太字・斜体での強調は使いません
- 仕様を変更した際、利用規約・プライバシーポリシー・特定商取引法に基づく表記などに変更が必要になってないかを確認し、必要があれば修正を行なってください。
- better-auth や drizzle や expo や cloudflare などの公式 docs を読み込み、なるべく公式 docs の案内に沿った実装や設計を行なってください。

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
