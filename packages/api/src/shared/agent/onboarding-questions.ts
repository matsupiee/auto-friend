import type { Personality, Preference, Romance } from "@auto-friend/db/constants/agent-parameters";

export type ParameterDelta = {
  personality?: Partial<Personality>;
  romance?: Partial<Romance>;
  preference?: Partial<Preference>;
};

export type OnboardingQuestion = {
  id: string;
  text: string;
  options: Array<{ id: string; label: string; delta: ParameterDelta }>;
};

// 性格・恋愛・価値観パラメータを決める10問（要件定義 1.1）。
// 自由記述はさせず、自然な質問への回答からパラメータを組み立てる。
export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "holiday",
    text: "休日の過ごし方は？",
    options: [
      {
        id: "out",
        label: "友達を誘って外に出かける",
        delta: {
          personality: { extroversion: 0.25, impulsiveness: 0.05 },
          preference: { sociality: 0.1 },
        },
      },
      {
        id: "few",
        label: "気の合う1〜2人とゆっくり",
        delta: {
          personality: { agreeableness: 0.1, extroversion: 0.05 },
          preference: { stability: 0.1 },
        },
      },
      {
        id: "alone",
        label: "一人で趣味に没頭する",
        delta: {
          personality: { extroversion: -0.25, openness: 0.1 },
          preference: { creativity: 0.1 },
        },
      },
      {
        id: "mood",
        label: "その日の気分で決める",
        delta: {
          personality: { impulsiveness: 0.2, openness: 0.1 },
          preference: { adventure: 0.1 },
        },
      },
    ],
  },
  {
    id: "party",
    text: "初対面の人が多い飲み会に誘われたら？",
    options: [
      {
        id: "talk",
        label: "楽しみ！自分から話しかける",
        delta: {
          personality: { extroversion: 0.2, confidence: 0.2 },
          romance: { initiative: 0.15 },
        },
      },
      {
        id: "friend",
        label: "知り合いがいれば行く",
        delta: { personality: { agreeableness: 0.1, confidence: -0.05 } },
      },
      {
        id: "decline",
        label: "疲れそうなので断る",
        delta: { personality: { extroversion: -0.2 }, romance: { sensitivity: 0.1 } },
      },
      {
        id: "mood_maker",
        label: "盛り上げ役に回る",
        delta: { personality: { humor: 0.25, extroversion: 0.15 }, romance: { flirtiness: 0.05 } },
      },
    ],
  },
  {
    id: "punctual",
    text: "友達との約束の時間には？",
    options: [
      {
        id: "early",
        label: "10分前には着いている",
        delta: {
          personality: { conscientiousness: 0.25 },
          romance: { loyalty: 0.1 },
          preference: { stability: 0.1 },
        },
      },
      { id: "just", label: "ぴったりに着く", delta: { personality: { conscientiousness: 0.1 } } },
      {
        id: "late",
        label: "少し遅れがち",
        delta: { personality: { conscientiousness: -0.15, impulsiveness: 0.1 } },
      },
      {
        id: "free",
        label: "そもそも予定を詰めない",
        delta: {
          personality: { openness: 0.1, conscientiousness: -0.1 },
          preference: { adventure: 0.05 },
        },
      },
    ],
  },
  {
    id: "bad_day",
    text: "嫌なことがあったときは？",
    options: [
      {
        id: "share",
        label: "すぐ誰かに話して聞いてもらう",
        delta: {
          personality: { emotionality: 0.15, extroversion: 0.1 },
          preference: { kindness: 0.1 },
        },
      },
      {
        id: "think",
        label: "一人で考えて整理する",
        delta: {
          personality: { conscientiousness: 0.1, emotionality: -0.05 },
          romance: { sensitivity: 0.1 },
        },
      },
      {
        id: "sleep",
        label: "寝たら忘れる",
        delta: {
          personality: { emotionality: -0.2, confidence: 0.05 },
          romance: { forgiveness: 0.15 },
        },
      },
      {
        id: "linger",
        label: "しばらく引きずってしまう",
        delta: {
          personality: { emotionality: 0.25 },
          romance: { sensitivity: 0.2, forgiveness: -0.1 },
        },
      },
    ],
  },
  {
    id: "crush_action",
    text: "気になる人ができたら？",
    options: [
      {
        id: "approach",
        label: "自分からどんどん誘う",
        delta: {
          personality: { confidence: 0.1 },
          romance: { initiative: 0.3, romanticDrive: 0.15 },
        },
      },
      {
        id: "signal",
        label: "それとなくサインを出して待つ",
        delta: { romance: { flirtiness: 0.2, initiative: 0.05 } },
      },
      {
        id: "wait",
        label: "相手から来るまで待つ",
        delta: { romance: { initiative: -0.2, sensitivity: 0.1 } },
      },
      {
        id: "not_now",
        label: "今は恋愛より友達や趣味",
        delta: { romance: { romanticDrive: -0.25, commitment: -0.05 } },
      },
    ],
  },
  {
    id: "partner_friends",
    text: "恋人がほかの人と仲良くしていたら？",
    options: [
      {
        id: "fine",
        label: "全然気にならない",
        delta: { personality: { confidence: 0.1 }, romance: { jealousy: -0.25, forgiveness: 0.1 } },
      },
      {
        id: "quiet",
        label: "モヤモヤするけど言わない",
        delta: { romance: { jealousy: 0.1, sensitivity: 0.1 } },
      },
      {
        id: "honest",
        label: "正直に「嫌だ」と伝える",
        delta: {
          personality: { confidence: 0.1, conscientiousness: 0.05 },
          romance: { jealousy: 0.15 },
        },
      },
      {
        id: "anxious",
        label: "かなり不安になる",
        delta: { personality: { emotionality: 0.1 }, romance: { jealousy: 0.3, sensitivity: 0.1 } },
      },
    ],
  },
  {
    id: "ideal_love",
    text: "理想の恋愛は？",
    options: [
      {
        id: "stable",
        label: "長く安定した関係",
        delta: { romance: { commitment: 0.25, loyalty: 0.15 }, preference: { stability: 0.2 } },
      },
      {
        id: "thrill",
        label: "ドキドキが続く刺激的な関係",
        delta: {
          personality: { impulsiveness: 0.1 },
          romance: { flirtiness: 0.15, commitment: -0.1 },
          preference: { adventure: 0.2 },
        },
      },
      {
        id: "friendly",
        label: "友達みたいに何でも話せる関係",
        delta: { personality: { agreeableness: 0.1 }, preference: { humor: 0.2, kindness: 0.1 } },
      },
      {
        id: "growth",
        label: "お互いを高め合える関係",
        delta: {
          personality: { conscientiousness: 0.1 },
          preference: { ambition: 0.25, intelligence: 0.15 },
        },
      },
    ],
  },
  {
    id: "seek",
    text: "相手に一番求めるものは？",
    options: [
      { id: "laugh", label: "一緒にいて笑えること", delta: { preference: { humor: 0.3 } } },
      { id: "kind", label: "優しさ・思いやり", delta: { preference: { kindness: 0.3 } } },
      { id: "looks", label: "見た目や雰囲気", delta: { preference: { appearance: 0.3 } } },
      {
        id: "deep",
        label: "頭の良さ・話の深さ",
        delta: { preference: { intelligence: 0.3, creativity: 0.1 } },
      },
    ],
  },
  {
    id: "fight",
    text: "喧嘩をしたら？",
    options: [
      {
        id: "apologize",
        label: "すぐに自分から謝る",
        delta: { personality: { agreeableness: 0.15 }, romance: { forgiveness: 0.2 } },
      },
      {
        id: "talk",
        label: "落ち着いてから話し合う",
        delta: {
          personality: { conscientiousness: 0.1, emotionality: -0.05 },
          romance: { forgiveness: 0.1 },
        },
      },
      {
        id: "wait",
        label: "相手が謝るまで待つ",
        delta: { personality: { confidence: 0.1 }, romance: { forgiveness: -0.15 } },
      },
      {
        id: "distance",
        label: "しばらく距離を置く",
        delta: {
          personality: { extroversion: -0.05 },
          romance: { forgiveness: -0.05, sensitivity: 0.1 },
        },
      },
    ],
  },
  {
    id: "challenge",
    text: "新しいことに挑戦するのは？",
    options: [
      {
        id: "love",
        label: "大好き。思い立ったらすぐやる",
        delta: {
          personality: { openness: 0.25, impulsiveness: 0.15 },
          preference: { adventure: 0.1 },
        },
      },
      {
        id: "research",
        label: "調べてから始める",
        delta: {
          personality: { openness: 0.1, conscientiousness: 0.1 },
          preference: { intelligence: 0.05 },
        },
      },
      {
        id: "familiar",
        label: "慣れたことの方が安心",
        delta: {
          personality: { openness: -0.2 },
          romance: { loyalty: 0.1 },
          preference: { stability: 0.1 },
        },
      },
      {
        id: "together",
        label: "誰かと一緒ならやってみる",
        delta: {
          personality: { agreeableness: 0.1, extroversion: 0.05 },
          preference: { sociality: 0.15 },
        },
      },
    ],
  },
];
