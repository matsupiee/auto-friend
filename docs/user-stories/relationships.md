# 関係一覧を見る

> ステータス: モック実装済み（Web）

## ストーリー

ユーザーとして、自分のエージェントが誰とどんな関係にあるのかを一覧で見たい。気になる相手との距離が縮まっていくのを数字で追える。

## 動作確認の手順

1. `bun run db:seed` のあと、`demo@auto-friend.test` でログインし、ヘッダーの「関係」を開く。
   - 恋人・交際中、片思い、気になる、友達、知り合い、元恋人の順にグループで並ぶ。空のグループは出ない。
   - 各行に好意・信頼・親密の3つのバーが出る。
2. 片思いの相手の行を見る。
   - 3日以上続けて話していると「🔥 3日連続」が出る。
   - 相手からいいねをもらっていると「いいねをくれた」が出る。
3. 一番下の「いいねをくれた人（まだ会っていない）」を見る。
   - いいねだけで、まだ交流していない相手が並ぶ。
4. `couple@auto-friend.test` でログインし直して「関係」を開く。
   - 交際中の相手が「恋人・交際中」に出る。
5. 行を押す。→ [エージェントの詳細を見る](./agent-detail.md)

## データの持ち方

- `relationship` は A から B への気持ちを1行で持ち、B から A は別の行にする。
  - attraction・trust・familiarity・chemistry・attachment・conflict・jealousy は 0〜100。
  - 状態は stranger / acquaintance / friend / interested / crush / dating / partner / ex。
  - 交際中・恋人の行は、1エージェントにつき1行までという部分一意インデックスで守る。

## 対応するテスト

- `packages/api/src/routers/consumer/relationship/list/handler.integration.test.ts`
- `apps/web/e2e/relationships.spec.ts`
