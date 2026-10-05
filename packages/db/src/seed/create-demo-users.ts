import type { Avatar } from "@auto-friend/avatar/avatar-schema";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import type { Database } from "../index";
import type { AgentEventType } from "../constants/agent-parameters";
import { agent } from "../schema/agent";
import { agentEvent } from "../schema/agent-event";
import type { AgentEventPayload } from "../schema/agent-event";
import { account, user } from "../schema/auth";
import { relationship } from "../schema/relationship";
import type { SeedRng } from "./create-seed-rng";

type RelationshipInsert = typeof relationship.$inferInsert;
type SeedAgentRow = typeof agent.$inferSelect;

export const DEMO_PASSWORD = "demo-password";

export const demoAccounts = {
  single: { email: "demo@auto-friend.test", name: "デモ（片思い中）" },
  couple: { email: "couple@auto-friend.test", name: "デモ（交際中）" },
} as const;

const basePersonality = {
  extroversion: 0.6,
  openness: 0.7,
  agreeableness: 0.65,
  conscientiousness: 0.55,
  emotionality: 0.5,
  impulsiveness: 0.45,
  humor: 0.7,
  confidence: 0.5,
};
const baseRomance = {
  romanticDrive: 0.7,
  loyalty: 0.7,
  jealousy: 0.5,
  commitment: 0.7,
  flirtiness: 0.4,
  initiative: 0.55,
  sensitivity: 0.5,
  forgiveness: 0.6,
};
const basePreference = {
  humor: 0.8,
  kindness: 0.7,
  ambition: 0.4,
  intelligence: 0.5,
  appearance: 0.4,
  stability: 0.5,
  adventure: 0.5,
  creativity: 0.6,
  sociality: 0.5,
};

// デモユーザーの見た目。ストーリーの確認で毎回同じ顔になるよう固定する
const haruAvatar: Avatar = {
  face: { shape: "oval", skinColor: "natural", cheek: "none" },
  hair: { style: "mash", color: "darkBrown", flip: false },
  eyebrow: { style: "natural", color: "darkBrown", y: 0, size: 0, rotation: 0, spacing: 0 },
  eye: { style: "round", color: "brown", y: 0, size: 0, rotation: 0, spacing: 0 },
  nose: { style: "curve", y: 0, size: 0 },
  mouth: { style: "smile", color: "natural", y: 0, size: 0 },
  facialHair: { mustache: "none", beard: "none", color: "darkBrown" },
  glasses: { style: "round", color: "black", size: 0 },
  mole: { visible: false, x: 0, y: 0 },
  body: { height: 62, build: 45 },
  favoriteColor: "blue",
};
const minaAvatar: Avatar = {
  face: { shape: "round", skinColor: "light", cheek: "blush" },
  hair: { style: "long", color: "brown", flip: false },
  eyebrow: { style: "thin", color: "brown", y: 0, size: 0, rotation: 0, spacing: 0 },
  eye: { style: "lashes", color: "brown", y: 0, size: 1, rotation: 0, spacing: 0 },
  nose: { style: "dot", y: 0, size: 0 },
  mouth: { style: "lips", color: "pink", y: 0, size: -1 },
  facialHair: { mustache: "none", beard: "none", color: "brown" },
  glasses: { style: "none", color: "black", size: 0 },
  mole: { visible: true, x: 4, y: 2 },
  body: { height: 42, build: 40 },
  favoriteColor: "pink",
};

async function createLoginUser(db: Database, email: string, name: string): Promise<string> {
  await db.delete(user).where(eq(user.email, email));
  const userId = crypto.randomUUID();
  await db.insert(user).values({ id: userId, email, name, emailVerified: true });
  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(DEMO_PASSWORD),
  });
  return userId;
}

// ストーリーの動作確認用に、数日ぶんの出来事がすでにあるデモユーザーを2人作る。
// - single: 3日目に片思いが始まり、相手もまんざらではない。次の日に進めると告白が起きやすい
// - couple: すでに交際中で、恋人が嫉妬して揉め、仲直りした履歴がある
export async function createDemoUsers(
  db: Database,
  rng: SeedRng,
  sakura: SeedAgentRow[],
  relationships: Map<string, RelationshipInsert>,
): Promise<void> {
  const takenIds = new Set(
    [...relationships.values()]
      .filter((r) => r.state === "dating" || r.state === "partner")
      .map((r) => r.sourceAgentId),
  );
  const singles = (gender: "male" | "female", likes: "male" | "female") =>
    sakura.filter(
      (a) => a.gender === gender && a.romanticPreference.includes(likes) && !takenIds.has(a.id),
    );
  const pickDistinct = <T extends { id: string }>(pool: T[], count: number, exclude: Set<string>) =>
    rng.sample(
      pool.filter((a) => !exclude.has(a.id)),
      count,
    );

  const relationshipRows: RelationshipInsert[] = [];
  const eventRows: Array<typeof agentEvent.$inferInsert> = [];
  const rel = (
    sourceAgentId: string,
    targetAgentId: string,
    values: Partial<RelationshipInsert> & { state: RelationshipInsert["state"] },
  ) =>
    relationshipRows.push({
      sourceAgentId,
      targetAgentId,
      stateChangedDay: 1,
      lastInteractionDay: 3,
      ...values,
    });
  const ev = (
    day: number,
    minuteOfDay: number,
    type: AgentEventType,
    actorAgentId: string,
    targetAgentId: string | null,
    importance = 0,
    payload: AgentEventPayload = {},
  ) => eventRows.push({ day, minuteOfDay, type, actorAgentId, targetAgentId, importance, payload });

  // 片思い中のデモ（男性・女性が恋愛対象）
  {
    const userId = await createLoginUser(db, demoAccounts.single.email, demoAccounts.single.name);
    const [me] = await db
      .insert(agent)
      .values({
        userId,
        isSakura: false,
        displayName: "ハル",
        gender: "male",
        avatar: haruAvatar,
        romanticPreference: ["female"],
        birthDate: "2001-04-12",
        birthplace: "神奈川県",
        schoolType: "共学の公立高校",
        club: "軽音部",
        circle: "写真サークル",
        hobbies: ["カフェ巡り", "写真", "音楽ライブ", "映画"],
        personality: basePersonality,
        romance: baseRomance,
        preference: basePreference,
        appearance: 0.65,
        joinedDay: 1,
      })
      .returning();
    if (!me) throw new Error("failed to create demo agent");

    const used = new Set<string>();
    const [crush, admirer, ...likers] = pickDistinct(singles("female", "male"), 14, used);
    if (!crush || !admirer) throw new Error("not enough sakura agents");
    [crush, admirer, ...likers].forEach((a) => used.add(a.id));
    const [friend, other] = pickDistinct(sakura, 2, used);
    if (!friend || !other) throw new Error("not enough sakura agents");

    rel(me.id, crush.id, {
      state: "crush",
      attraction: 72,
      trust: 42,
      familiarity: 52,
      chemistry: 70,
      attachment: 50,
      interactionStreak: 3,
      stateChangedDay: 3,
    });
    rel(crush.id, me.id, {
      state: "interested",
      attraction: 56,
      trust: 40,
      familiarity: 50,
      chemistry: 68,
      attachment: 30,
      interactionStreak: 3,
      likedDay: 1,
    });
    rel(me.id, friend.id, {
      state: "friend",
      attraction: 10,
      trust: 35,
      familiarity: 40,
      chemistry: 55,
      attachment: 10,
      interactionStreak: 1,
    });
    rel(friend.id, me.id, {
      state: "friend",
      attraction: 8,
      trust: 33,
      familiarity: 38,
      chemistry: 55,
      attachment: 10,
      interactionStreak: 1,
    });
    rel(me.id, other.id, {
      state: "acquaintance",
      attraction: 15,
      trust: 5,
      familiarity: 12,
      chemistry: 30,
      conflict: 8,
      lastInteractionDay: 2,
    });
    rel(other.id, me.id, {
      state: "acquaintance",
      attraction: 10,
      trust: 5,
      familiarity: 12,
      chemistry: 30,
      conflict: 8,
      lastInteractionDay: 2,
    });
    rel(admirer.id, me.id, {
      state: "interested",
      attraction: 50,
      trust: 30,
      familiarity: 30,
      chemistry: 50,
      attachment: 20,
      likedDay: 1,
      lastInteractionDay: 3,
    });
    rel(me.id, admirer.id, {
      state: "acquaintance",
      attraction: 25,
      trust: 20,
      familiarity: 28,
      chemistry: 50,
      lastInteractionDay: 3,
    });
    likers.forEach((liker, index) => {
      const day = index < 8 ? 1 : index < 10 ? 2 : 3;
      rel(liker.id, me.id, {
        state: "stranger",
        attraction: 15,
        likedDay: day,
        lastInteractionDay: null,
        stateChangedDay: day,
      });
      rel(me.id, liker.id, { state: "stranger", lastInteractionDay: null, stateChangedDay: day });
      ev(day, rng.int(9 * 60, 23 * 60), "liked", liker.id, me.id);
    });

    ev(1, 10 * 60 + 12, "liked", crush.id, me.id);
    ev(1, 10 * 60 + 40, "liked", me.id, crush.id);
    ev(1, 10 * 60 + 43, "matched", crush.id, me.id, 1);
    ev(1, 11 * 60 + 5, "first_met", me.id, crush.id);
    ev(1, 13 * 60 + 30, "first_met", friend.id, me.id);
    ev(1, 15 * 60 + 10, "first_met", me.id, admirer.id);
    ev(1, 20 * 60 + 2, "liked", admirer.id, me.id);
    ev(2, 8 * 60 + 42, "first_met", me.id, other.id);
    ev(2, 12 * 60 + 17, "awkward", other.id, me.id);
    ev(2, 15 * 60 + 3, "hobby_talk", crush.id, me.id, 0, { hobby: "カフェ巡り" });
    ev(2, 18 * 60 + 53, "chatted", me.id, friend.id);
    ev(2, 18 * 60 + 55, "became_friends", me.id, friend.id, 1);
    ev(2, 22 * 60 + 31, "became_interested", me.id, crush.id, 1);
    ev(3, 9 * 60 + 20, "chatted", admirer.id, me.id);
    ev(3, 9 * 60 + 25, "became_interested", admirer.id, me.id, 1);
    ev(3, 12 * 60 + 48, "consulted", friend.id, me.id);
    ev(3, 18 * 60 + 53, "hobby_talk", me.id, crush.id, 0, { hobby: "写真" });
    ev(3, 18 * 60 + 53, "streak", me.id, crush.id, 1, { streakDays: 3 });
    ev(3, 22 * 60 + 31, "fell_for", me.id, crush.id, 2);
  }

  // 交際中のデモ（女性・男性が恋愛対象）
  {
    const userId = await createLoginUser(db, demoAccounts.couple.email, demoAccounts.couple.name);
    const [me] = await db
      .insert(agent)
      .values({
        userId,
        isSakura: false,
        displayName: "ミナ",
        gender: "female",
        avatar: minaAvatar,
        romanticPreference: ["male"],
        birthDate: "1999-11-03",
        birthplace: "大阪府",
        schoolType: "共学の私立高校",
        club: "ダンス部",
        circle: "旅行サークル",
        hobbies: ["旅行", "K-POP", "カフェ巡り", "美容", "お笑い"],
        personality: { ...basePersonality, extroversion: 0.8, emotionality: 0.6 },
        romance: { ...baseRomance, jealousy: 0.4 },
        preference: { ...basePreference, adventure: 0.8 },
        appearance: 0.7,
        joinedDay: 1,
      })
      .returning();
    if (!me) throw new Error("failed to create demo agent");

    const used = new Set<string>();
    const [partner, ...likers] = pickDistinct(singles("male", "female"), 8, used);
    if (!partner) throw new Error("not enough sakura agents");
    [partner, ...likers].forEach((a) => used.add(a.id));
    takenIds.add(partner.id);
    const [rival] = pickDistinct(
      sakura.filter((a) => a.gender === "male"),
      1,
      used,
    );
    if (!rival) throw new Error("not enough sakura agents");

    rel(me.id, partner.id, {
      state: "dating",
      attraction: 80,
      trust: 58,
      familiarity: 66,
      chemistry: 75,
      attachment: 65,
      conflict: 10,
      interactionStreak: 3,
      stateChangedDay: 2,
    });
    rel(partner.id, me.id, {
      state: "dating",
      attraction: 82,
      trust: 55,
      familiarity: 66,
      chemistry: 75,
      attachment: 70,
      conflict: 12,
      jealousy: 20,
      interactionStreak: 3,
      stateChangedDay: 2,
    });
    rel(me.id, rival.id, {
      state: "friend",
      attraction: 30,
      trust: 35,
      familiarity: 40,
      chemistry: 60,
      attachment: 10,
    });
    rel(rival.id, me.id, {
      state: "interested",
      attraction: 52,
      trust: 35,
      familiarity: 40,
      chemistry: 60,
      attachment: 20,
    });
    likers.forEach((liker, index) => {
      const day = (index % 3) + 1;
      rel(liker.id, me.id, {
        state: "stranger",
        attraction: 15,
        likedDay: day,
        lastInteractionDay: null,
        stateChangedDay: day,
      });
      rel(me.id, liker.id, { state: "stranger", lastInteractionDay: null, stateChangedDay: day });
      ev(day, rng.int(9 * 60, 23 * 60), "liked", liker.id, me.id);
    });

    ev(1, 9 * 60 + 15, "first_met", partner.id, me.id);
    ev(1, 14 * 60, "first_met", me.id, rival.id);
    ev(1, 21 * 60 + 40, "hobby_talk", me.id, partner.id, 0, { hobby: "旅行" });
    ev(2, 13 * 60, "went_on_date", partner.id, me.id, 1);
    ev(2, 21 * 60 + 10, "confessed", partner.id, me.id, 2);
    ev(2, 21 * 60 + 25, "confession_accepted", me.id, partner.id, 2);
    ev(3, 11 * 60 + 30, "hobby_talk", me.id, rival.id, 0, { hobby: "K-POP" });
    ev(3, 12 * 60, "jealous", partner.id, me.id, 2, { thirdAgentId: rival.id });
    ev(3, 19 * 60, "argued", partner.id, me.id, 1);
    ev(3, 22 * 60 + 5, "made_up", me.id, partner.id, 1);
    ev(3, 22 * 60 + 5, "streak", me.id, partner.id, 1, { streakDays: 3 });
  }

  // デモ用の行と同じ組み合わせの初期関係は上書きする
  const demoKeys = new Set(relationshipRows.map((r) => `${r.sourceAgentId}>${r.targetAgentId}`));
  for (const key of demoKeys) relationships.delete(key);
  for (let i = 0; i < relationshipRows.length; i += 100) {
    await db
      .insert(relationship)
      .values(relationshipRows.slice(i, i + 100))
      .onConflictDoNothing();
  }
  for (let i = 0; i < eventRows.length; i += 100) {
    await db.insert(agentEvent).values(eventRows.slice(i, i + 100));
  }
}
