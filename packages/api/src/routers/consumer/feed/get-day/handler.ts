import { agent } from "@auto-friend/db/schema/agent";
import { agentEvent } from "@auto-friend/db/schema/agent-event";
import { and, asc, eq, inArray, or } from "drizzle-orm";
import type z from "zod";

import type { ProtectedContext } from "../../../../context";
import { getCurrentDay } from "../../../../shared/agent/get-current-day";
import { getMyAgentOrThrow } from "../../../../shared/agent/get-my-agent-or-throw";
import { resolveAvatar } from "../../../../shared/agent/resolve-avatar";
import { renderEventText } from "../../../../shared/event/render-event-text";
import type { feedGetDayInputSchema } from "./route";

type EventRow = typeof agentEvent.$inferSelect;

const CONVERSATION_TYPES = new Set([
  "first_met",
  "chatted",
  "hobby_talk",
  "consulted",
  "went_on_date",
]);
// 相手が自分に向けた気持ちは、相手の名前を伏せる
const ANONYMOUS_WHEN_TARGET = new Set(["became_interested", "fell_for"]);

// エージェント自身の視点で書く、1日1回の日記（テンプレート版）
function writeDiary(meId: string, events: EventRow[], nameOf: (id: string) => string): string[] {
  const lines: string[] = [];
  const add = (line: string) => {
    if (!lines.includes(line)) lines.push(line);
  };
  const likes = events.filter((e) => e.type === "liked" && e.targetAgentId === meId).length;
  const other = (e: EventRow) =>
    nameOf(e.actorAgentId === meId ? (e.targetAgentId ?? "") : e.actorAgentId);

  if (likes >= 6)
    add(`今日はなんだか、たくさんの人がいいねをくれた（${likes}件）。ちょっと嬉しい。`);
  else if (likes > 0) add(`いいねが${likes}件届いていた。`);

  const met = events.filter((e) => e.type === "first_met").map(other);
  if (met.length > 0)
    add(`${met.slice(0, 3).join("、")}${met.length > 3 ? "たち" : ""}と知り合った。`);

  for (const e of events) {
    const mine = e.actorAgentId === meId;
    switch (e.type) {
      case "hobby_talk":
        add(`${other(e)}と${e.payload.hobby ?? "趣味"}の話で盛り上がった。`);
        break;
      case "went_on_date":
        add(`${other(e)}とデートした。`);
        break;
      case "argued":
        add(`${other(e)}とちょっと揉めてしまった。`);
        break;
      case "made_up":
        add(`${other(e)}と仲直りできて、ほっとした。`);
        break;
      case "became_interested":
        if (mine) add(`${other(e)}のことが、なんだか気になる。`);
        break;
      case "fell_for":
        if (mine) add(`${other(e)}のことばかり考えてしまう。たぶん、好きなんだと思う。`);
        break;
      case "confessed":
        add(
          mine
            ? `勇気を出して、${other(e)}に告白した。`
            : `${other(e)}に告白された。びっくりした。`,
        );
        break;
      case "confession_accepted":
        add(mine ? `${other(e)}と付き合うことになった。` : `返事はOKだった。夢みたい。`);
        break;
      case "confession_rejected":
        add(
          mine
            ? `${other(e)}の気持ちには応えられなかった。`
            : `……ダメだった。しばらく立ち直れそうにない。`,
        );
        break;
      case "became_partners":
        add(`${other(e)}と、ちゃんと恋人になった。`);
        break;
      case "jealous":
        if (mine)
          add(
            `${other(e)}が${nameOf(e.payload.thirdAgentId ?? "")}と仲良くしているのを見て、モヤモヤした。`,
          );
        break;
      case "broke_up":
        add(`${other(e)}と別れた。`);
        break;
      case "streak":
        add(`${other(e)}とは、もう${e.payload.streakDays ?? 3}日連続で話している。`);
        break;
      case "spent_alone":
        add(`一人の時間は${e.payload.hobby ?? "趣味"}をして過ごした。`);
        break;
      default:
        break;
    }
  }
  if (lines.length === 0) add("今日は静かな一日だった。");
  return lines.slice(0, 6);
}

export async function handler({
  ctx,
  input,
}: {
  ctx: ProtectedContext;
  input: z.infer<typeof feedGetDayInputSchema>;
}) {
  const me = await getMyAgentOrThrow(ctx.db, ctx.session.user.id);
  const currentDay = await getCurrentDay(ctx.db);
  const day = Math.min(currentDay, Math.max(me.joinedDay, input.day ?? currentDay));

  const events = await ctx.db
    .select()
    .from(agentEvent)
    .where(
      and(
        eq(agentEvent.day, day),
        or(eq(agentEvent.actorAgentId, me.id), eq(agentEvent.targetAgentId, me.id)),
      ),
    )
    .orderBy(asc(agentEvent.minuteOfDay), asc(agentEvent.createdAt));

  const ids = new Set<string>();
  for (const e of events) {
    ids.add(e.actorAgentId);
    if (e.targetAgentId) ids.add(e.targetAgentId);
    if (e.payload.thirdAgentId) ids.add(e.payload.thirdAgentId);
  }
  const agents = new Map(
    ids.size === 0
      ? []
      : (
          await ctx.db
            .select({
              id: agent.id,
              displayName: agent.displayName,
              gender: agent.gender,
              avatar: agent.avatar,
            })
            .from(agent)
            .where(inArray(agent.id, [...ids]))
        ).map((a) => [a.id, a]),
  );
  const nameOf = (id: string) => agents.get(id)?.displayName ?? "誰か";
  const counterpartOf = (id: string) => {
    const found = agents.get(id);
    return found ? { id, displayName: found.displayName, avatar: resolveAvatar(found) } : null;
  };

  const items = events.flatMap((e) => {
    const text = renderEventText(e, me.id, nameOf);
    if (text === null) return [];
    const counterpartId = e.actorAgentId === me.id ? e.targetAgentId : e.actorAgentId;
    const hidden = e.targetAgentId === me.id && ANONYMOUS_WHEN_TARGET.has(e.type);
    return [
      {
        id: e.id,
        minuteOfDay: e.minuteOfDay,
        type: e.type,
        text,
        importance: e.importance,
        counterpart: counterpartId && !hidden ? counterpartOf(counterpartId) : null,
      },
    ];
  });

  return {
    day,
    currentDay,
    firstDay: me.joinedDay,
    events: items,
    stats: {
      likes: events.filter((e) => e.type === "liked" && e.targetAgentId === me.id).length,
      newAcquaintances: events.filter((e) => e.type === "first_met").length,
      conversations: events.filter((e) => CONVERSATION_TYPES.has(e.type)).length,
    },
    diary: writeDiary(me.id, events, nameOf),
  };
}
