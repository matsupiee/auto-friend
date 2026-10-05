import type { RelationshipStateName } from "@auto-friend/db/constants/agent-parameters";
import { agent } from "@auto-friend/db/schema/agent";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { relationship } from "@auto-friend/db/schema/relationship";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, ne, or } from "drizzle-orm";
import type z from "zod";

import type { ProtectedContext } from "../../../../context";
import { computeAge } from "../../../../shared/agent/compute-age";
import { getCurrentDay } from "../../../../shared/agent/get-current-day";
import { getMyAgentOrThrow } from "../../../../shared/agent/get-my-agent-or-throw";
import { renderEventText } from "../../../../shared/event/render-event-text";
import type { agentGetInputSchema } from "./route";

const PERSONALITY_LABELS: Record<string, string> = {
  extroversion: "外向性",
  openness: "好奇心",
  agreeableness: "協調性",
  conscientiousness: "誠実さ",
  emotionality: "感情の豊かさ",
  impulsiveness: "衝動性",
  humor: "ユーモア",
  confidence: "自信",
};
const ROMANCE_LABELS: Record<string, string> = {
  romanticDrive: "恋愛への積極さ",
  loyalty: "一途さ",
  jealousy: "嫉妬しやすさ",
  commitment: "長期志向",
  flirtiness: "思わせぶり度",
  initiative: "行動力",
  sensitivity: "傷つきやすさ",
  forgiveness: "許す力",
};

function toParameters(values: Record<string, number>, labels: Record<string, string>) {
  return Object.entries(labels).map(([key, label]) => ({ key, label, value: values[key] ?? 0 }));
}

function moodOf(types: string[]): { emoji: string; label: string } {
  if (types.includes("confession_accepted") || types.includes("became_partners"))
    return { emoji: "🥰", label: "幸せいっぱい" };
  if (types.includes("broke_up") || types.includes("confession_rejected"))
    return { emoji: "😢", label: "落ち込んでいる" };
  if (types.includes("fell_for")) return { emoji: "💓", label: "恋してる" };
  if (types.includes("jealous") || types.includes("argued"))
    return { emoji: "😣", label: "モヤモヤしている" };
  if (types.filter((t) => t === "liked").length >= 5) return { emoji: "😊", label: "ご機嫌" };
  if (types.includes("first_met") || types.includes("hobby_talk"))
    return { emoji: "🙂", label: "楽しそう" };
  return { emoji: "😌", label: "穏やか" };
}

// 他人の秘めた気持ちは見せない。片思い・気になっている状態は「友達」として返す
function publicState(state: RelationshipStateName): RelationshipStateName {
  return state === "crush" || state === "interested" ? "friend" : state;
}

export async function handler({
  ctx,
  input,
}: {
  ctx: ProtectedContext;
  input: z.infer<typeof agentGetInputSchema>;
}) {
  const me = await getMyAgentOrThrow(ctx.db, ctx.session.user.id);
  const [target] = await ctx.db.select().from(agent).where(eq(agent.id, input.agentId)).limit(1);
  if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "エージェントが見つかりません" });
  const isMine = target.id === me.id;
  const currentDay = await getCurrentDay(ctx.db);

  const outgoing = await ctx.db
    .select({
      targetAgentId: relationship.targetAgentId,
      state: relationship.state,
      familiarity: relationship.familiarity,
      attraction: relationship.attraction,
      displayName: agent.displayName,
    })
    .from(relationship)
    .innerJoin(agent, eq(agent.id, relationship.targetAgentId))
    .where(and(eq(relationship.sourceAgentId, target.id), ne(relationship.state, "stranger")));
  const partner = outgoing.find((r) => r.state === "dating" || r.state === "partner");
  const closeAgents = outgoing
    .filter((r) => r.state !== "ex")
    .sort((a, b) => b.familiarity + b.attraction - (a.familiarity + a.attraction))
    .slice(0, 5)
    .map((r) => ({
      id: r.targetAgentId,
      displayName: r.displayName,
      state: isMine ? r.state : publicState(r.state),
    }));

  const events = await ctx.db
    .select()
    .from(agentEvent)
    .where(
      and(
        or(eq(agentEvent.actorAgentId, target.id), eq(agentEvent.targetAgentId, target.id)),
        gte(agentEvent.day, currentDay - 2),
      ),
    )
    .orderBy(desc(agentEvent.day), desc(agentEvent.minuteOfDay))
    .limit(200);

  const ids = new Set<string>();
  for (const e of events) {
    ids.add(e.actorAgentId);
    if (e.targetAgentId) ids.add(e.targetAgentId);
    if (e.payload.thirdAgentId) ids.add(e.payload.thirdAgentId);
  }
  const names = new Map(
    ids.size === 0
      ? []
      : (
          await ctx.db
            .select({ id: agent.id, displayName: agent.displayName })
            .from(agent)
            .where(inArray(agent.id, [...ids]))
        ).map((a) => [a.id, a.displayName]),
  );
  const nameOf = (id: string) => names.get(id) ?? "誰か";

  const recentEvents = events
    .map((e) => ({
      id: e.id,
      day: e.day,
      minuteOfDay: e.minuteOfDay,
      text: renderEventText(e, isMine ? target.id : null, nameOf),
    }))
    .filter((e): e is typeof e & { text: string } => e.text !== null)
    .slice(0, 10);

  const latestDayTypes = events
    .filter(
      (e) =>
        e.day === currentDay && (e.actorAgentId === target.id || e.targetAgentId === target.id),
    )
    .map((e) => (e.type === "liked" && e.actorAgentId === target.id ? "liked_other" : e.type));

  const interestCounts = new Map<string, number>();
  for (const e of events) {
    if (e.payload.hobby && (e.actorAgentId === target.id || e.targetAgentId === target.id)) {
      interestCounts.set(e.payload.hobby, (interestCounts.get(e.payload.hobby) ?? 0) + 1);
    }
  }
  const recentInterests = [...interestCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hobby]) => hobby);

  let myRelation = null;
  if (!isMine) {
    const [mineToThem] = await ctx.db
      .select()
      .from(relationship)
      .where(and(eq(relationship.sourceAgentId, me.id), eq(relationship.targetAgentId, target.id)))
      .limit(1);
    const [themToMe] = await ctx.db
      .select()
      .from(relationship)
      .where(and(eq(relationship.sourceAgentId, target.id), eq(relationship.targetAgentId, me.id)))
      .limit(1);
    myRelation = {
      state: mineToThem?.state ?? "stranger",
      likedMe: themToMe?.likedDay != null,
      iLiked: mineToThem?.likedDay != null,
    };
  }

  return {
    id: target.id,
    isMine,
    displayName: target.displayName,
    gender: target.gender,
    age: computeAge(target.birthDate),
    birthplace: target.birthplace,
    schoolType: target.schoolType,
    club: target.club,
    circle: target.circle,
    hobbies: target.hobbies,
    personality: toParameters(target.personality, PERSONALITY_LABELS),
    romance: isMine ? toParameters(target.romance, ROMANCE_LABELS) : null,
    mood: moodOf(latestDayTypes),
    partner: partner ? { id: partner.targetAgentId, displayName: partner.displayName } : null,
    closeAgents,
    recentInterests:
      recentInterests.length > 0 ? recentInterests.slice(0, 3) : target.hobbies.slice(0, 3),
    myRelation,
    recentEvents,
  };
}
