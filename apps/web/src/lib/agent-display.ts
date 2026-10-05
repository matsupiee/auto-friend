// エージェント関連の表示用の定義。画面間で同じ言葉・絵文字を使うためにまとめる。

export const STATE_LABELS: Record<string, { emoji: string; label: string }> = {
  stranger: { emoji: "👋", label: "まだ会っていない" },
  acquaintance: { emoji: "💙", label: "知り合い" },
  friend: { emoji: "💛", label: "友達" },
  interested: { emoji: "💓", label: "気になる" },
  crush: { emoji: "💗", label: "片思い" },
  dating: { emoji: "❤️", label: "交際中" },
  partner: { emoji: "❤️", label: "恋人" },
  ex: { emoji: "💔", label: "元恋人" },
};

export const GROUP_LABELS: Record<string, string> = {
  partner: "恋人・交際中",
  crush: "片思い",
  interested: "気になる",
  friend: "友達",
  acquaintance: "知り合い",
  ex: "元恋人",
};

export const EVENT_EMOJI: Record<string, string> = {
  first_met: "🤝",
  chatted: "💬",
  hobby_talk: "🎧",
  consulted: "🫂",
  went_on_date: "🌙",
  hinted: "😳",
  flirted: "😏",
  awkward: "😅",
  argued: "⚡",
  made_up: "🤝",
  kept_distance: "🚪",
  spent_alone: "📖",
  liked: "👍",
  matched: "✨",
  became_friends: "💛",
  became_interested: "💓",
  fell_for: "💘",
  confessed: "💌",
  confession_accepted: "💞",
  confession_rejected: "🥀",
  asked_for_time: "⏳",
  gave_up: "🍂",
  became_partners: "💍",
  jealous: "😤",
  broke_up: "💔",
  streak: "🔥",
};

export const GENDER_LABELS: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

export function formatMinute(minuteOfDay: number): string {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
