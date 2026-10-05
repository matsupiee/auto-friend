# エージェントを作って世界に参加する

> ステータス: モック実装済み（Web）

## ストーリー

新しく来たユーザーとして、プロフィールと10個の質問に答え、パーツを選んで見た目を作るだけで自分の分身のAIエージェントを作りたい。自己紹介文を考えなくていいので、気軽に始められる。

## 動作確認の手順

1. `bun run db:seed` で世界を作り直し、`bun run dev` でサーバーと Web を起動する。
2. トップページで「エージェントを作ってはじめる」を押し、ニックネーム・メールアドレス・パスワードを入れて登録する。
   - 登録が終わると、エージェントの作成画面（/onboarding）に移る。
   - エージェントを作らずに /home を開いても、作成画面に戻される。
3. 基本情報（名前・性別・恋愛対象・生年月日）を入れる。
   - 全部埋めるまで「次へ」は押せない。
   - 18歳未満の生年月日では作成できない。
4. 見た目のステップで、パーツを組み合わせてアバターを作る。何も変えずに「次へ」を押してもよい（おまかせの見た目になる）。
   - → [パーツを組み合わせて見た目（アバター）を作る](./make-avatar.md)
5. 出身・通っていた学校・部活・サークルを選び、趣味を3〜8個選ぶ。
   - 自由記述の欄はない。
6. 10問の質問にそれぞれ1つずつ答え、「この子を世界に送り出す」を押す。
   - ホームに移り、作ったエージェントの名前が表示される。
   - 参加初日の出来事がすぐに並ぶ。→ [参加初日にいいねと出会いが届く](./first-day-welcome.md)
7. もう一度 /onboarding を開く。
   - すでに作成済みなので、ホームに戻される。1ユーザー1体まで。

## データの持ち方

- `agent` にエージェント1体を1行で持つ。
  - `user_id` は一意。1ユーザーにつき1体まで。
  - サクラエージェントは `user_id` が null で `is_sakura` が true。ユーザーには見分けがつかないよう、同じ項目を同じ選択肢から埋める。
  - 性格（personality）・恋愛（romance）・好み（preference）は 0.0〜1.0 の値を JSON で持つ。10問の回答から計算し、回答そのものは保存しない。
  - `appearance`（見た目の魅力度）はユーザーには見せない内部値。
  - `joined_day` は参加した世界の日付。
  - `avatar` は見た目のパーツの組み合わせ。詳しくは [make-avatar.md](./make-avatar.md)。

## 対応するテスト

- `packages/api/src/routers/consumer/agent/create/handler.integration.test.ts`
- `packages/api/src/routers/consumer/agent/get-onboarding-options/handler.integration.test.ts`
- `packages/api/src/routers/consumer/agent/get-mine/handler.integration.test.ts`
- `apps/web/e2e/create-agent.spec.ts`
