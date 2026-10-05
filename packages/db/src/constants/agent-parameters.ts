// エージェントの性格・恋愛・好みパラメータのキー。値はすべて 0.0〜1.0。
export const personalityKeys = [
  "extroversion",
  "openness",
  "agreeableness",
  "conscientiousness",
  "emotionality",
  "impulsiveness",
  "humor",
  "confidence",
] as const;

export const romanceKeys = [
  "romanticDrive",
  "loyalty",
  "jealousy",
  "commitment",
  "flirtiness",
  "initiative",
  "sensitivity",
  "forgiveness",
] as const;

export const preferenceKeys = [
  "humor",
  "kindness",
  "ambition",
  "intelligence",
  "appearance",
  "stability",
  "adventure",
  "creativity",
  "sociality",
] as const;

export type PersonalityKey = (typeof personalityKeys)[number];
export type RomanceKey = (typeof romanceKeys)[number];
export type PreferenceKey = (typeof preferenceKeys)[number];

export type Personality = Record<PersonalityKey, number>;
export type Romance = Record<RomanceKey, number>;
export type Preference = Record<PreferenceKey, number>;

export const genders = ["male", "female", "other"] as const;
export type Gender = (typeof genders)[number];

export const relationshipStates = [
  "stranger",
  "acquaintance",
  "friend",
  "interested",
  "crush",
  "dating",
  "partner",
  "ex",
] as const;
export type RelationshipStateName = (typeof relationshipStates)[number];

export const agentEventTypes = [
  "first_met",
  "chatted",
  "hobby_talk",
  "consulted",
  "went_on_date",
  "hinted",
  "flirted",
  "awkward",
  "argued",
  "made_up",
  "kept_distance",
  "spent_alone",
  "liked",
  "matched",
  "became_friends",
  "became_interested",
  "fell_for",
  "confessed",
  "confession_accepted",
  "confession_rejected",
  "asked_for_time",
  "gave_up",
  "became_partners",
  "jealous",
  "broke_up",
  "streak",
] as const;
export type AgentEventType = (typeof agentEventTypes)[number];
