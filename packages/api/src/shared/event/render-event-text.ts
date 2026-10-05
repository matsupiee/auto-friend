import type { AgentEventType } from "@auto-friend/db/constants/agent-parameters";
import type { AgentEventPayload } from "@auto-friend/db/schema/agent-event";

type RenderableEvent = {
  type: AgentEventType;
  actorAgentId: string;
  targetAgentId: string | null;
  payload: AgentEventPayload;
};

type Phrases = {
  // 自分のエージェントが actor のとき
  asActor: (o: string, x: Extra) => string;
  // 自分のエージェントが target のとき。null なら表示しない
  asTarget: ((o: string, x: Extra) => string) | null;
  // 第三者として見るとき（世界のニュース）。null なら表示しない
  asWorld: ((a: string, t: string, x: Extra) => string) | null;
};

type Extra = { hobby: string; third: string; streakDays: number };

const PHRASES: Record<AgentEventType, Phrases> = {
  first_met: {
    asActor: (o) => `${o}と知り合いました`,
    asTarget: (o) => `${o}と知り合いました`,
    asWorld: (a, t) => `${a}と${t}が知り合いました`,
  },
  chatted: {
    asActor: (o) => `${o}と雑談しました`,
    asTarget: (o) => `${o}に話しかけられて、少し雑談しました`,
    asWorld: (a, t) => `${a}と${t}が雑談しました`,
  },
  hobby_talk: {
    asActor: (o, x) => `${o}と${x.hobby}の話で盛り上がりました`,
    asTarget: (o, x) => `${o}と${x.hobby}の話で盛り上がりました`,
    asWorld: (a, t, x) => `${a}と${t}が${x.hobby}の話で盛り上がりました`,
  },
  consulted: {
    asActor: (o) => `${o}に悩みを相談しました`,
    asTarget: (o) => `${o}から悩みを相談されました`,
    asWorld: (a, t) => `${a}が${t}に悩みを相談しました`,
  },
  went_on_date: {
    asActor: (o) => `${o}をデートに誘って出かけました`,
    asTarget: (o) => `${o}にデートに誘われて出かけました`,
    asWorld: (a, t) => `${a}と${t}がデートしました`,
  },
  hinted: {
    asActor: (o) => `${o}にそれとなく好意を匂わせました`,
    asTarget: (o) => `${o}から、好意を匂わせるような言葉をかけられました`,
    asWorld: null,
  },
  flirted: {
    asActor: (o) => `恋人がいるのに、${o}に思わせぶりな態度をとりました`,
    asTarget: (o) => `${o}から思わせぶりな態度をとられました`,
    asWorld: null,
  },
  awkward: {
    asActor: (o) => `${o}と少し気まずくなりました`,
    asTarget: (o) => `${o}と少し気まずくなりました`,
    asWorld: null,
  },
  argued: {
    asActor: (o) => `${o}と少し揉めたようです`,
    asTarget: (o) => `${o}と少し揉めたようです`,
    asWorld: null,
  },
  made_up: {
    asActor: (o) => `${o}と仲直りしました`,
    asTarget: (o) => `${o}と仲直りしました`,
    asWorld: null,
  },
  kept_distance: {
    asActor: (o) => `${o}と少し距離を置くことにしました`,
    asTarget: (o) => `${o}に少し距離を置かれているようです`,
    asWorld: null,
  },
  spent_alone: {
    asActor: (_o, x) => `一人で${x.hobby}を楽しんで過ごしました`,
    asTarget: null,
    asWorld: null,
  },
  liked: {
    asActor: (o) => `${o}にいいねしました`,
    asTarget: (o) => `${o}からいいねが届きました`,
    asWorld: null,
  },
  matched: {
    asActor: (o) => `${o}とマッチしました`,
    asTarget: (o) => `${o}とマッチしました`,
    asWorld: null,
  },
  became_friends: {
    asActor: (o) => `${o}と友達になりました`,
    asTarget: (o) => `${o}と友達になりました`,
    asWorld: (a, t) => `${a}と${t}が友達になりました`,
  },
  became_interested: {
    asActor: (o) => `${o}のことが気になり始めたようです`,
    // 相手の気持ちは名前を伏せて見せる
    asTarget: () => "誰かがあなたのエージェントのことを気になり始めたようです",
    asWorld: null,
  },
  fell_for: {
    asActor: (o) => `${o}のことを好きになったようです`,
    asTarget: () => "誰かがあなたのエージェントに片思いしているようです",
    asWorld: (a) => `${a}に好きな人ができたようです`,
  },
  confessed: {
    asActor: (o) => `${o}に告白しました`,
    asTarget: (o) => `${o}から告白されました`,
    asWorld: (a, t) => `${a}が${t}に告白しました`,
  },
  confession_accepted: {
    asActor: (o) => `${o}の告白を受け入れて、付き合うことになりました`,
    asTarget: (o) => `${o}が告白を受け入れてくれました。付き合うことになりました`,
    asWorld: (a, t) => `${t}と${a}が付き合い始めました`,
  },
  confession_rejected: {
    asActor: (o) => `${o}からの告白を断りました`,
    asTarget: (o) => `${o}に告白しましたが、ふられてしまいました`,
    asWorld: (a, t) => `${t}の告白は、${a}に届きませんでした`,
  },
  asked_for_time: {
    asActor: (o) => `${o}からの告白に、少し考える時間がほしいと答えました`,
    asTarget: (o) => `${o}から「少し考えさせて」と言われました`,
    asWorld: null,
  },
  gave_up: {
    asActor: (o) => `${o}のことを諦めることにしたようです`,
    asTarget: null,
    asWorld: null,
  },
  became_partners: {
    asActor: (o) => `${o}と正式に恋人になりました`,
    asTarget: (o) => `${o}と正式に恋人になりました`,
    asWorld: (a, t) => `${a}と${t}が正式に恋人になりました`,
  },
  jealous: {
    asActor: (o, x) => `${o}が${x.third}と親しくしているのを見て、嫉妬しているようです`,
    asTarget: (o, x) => `${x.third}とのことで、${o}に嫉妬されたようです`,
    asWorld: null,
  },
  broke_up: {
    asActor: (o) => `${o}と別れました`,
    asTarget: (o) => `${o}から別れを告げられました`,
    asWorld: (a, t) => `${a}と${t}が別れました`,
  },
  streak: {
    asActor: (o, x) => `${o}と${x.streakDays}日連続で話しています`,
    asTarget: (o, x) => `${o}と${x.streakDays}日連続で話しています`,
    asWorld: null,
  },
};

// 出来事をユーザー向けの文章にする（無料プランのテンプレート文。要件定義 16.2）。
// viewerAgentId を渡すとそのエージェント視点の文に、null なら世界のニュースとしての文になる。
// 見せない出来事は null を返す。
export function renderEventText(
  event: RenderableEvent,
  viewerAgentId: string | null,
  nameOf: (agentId: string) => string,
): string | null {
  const phrases = PHRASES[event.type];
  const extra: Extra = {
    hobby: event.payload.hobby ?? "趣味",
    third: event.payload.thirdAgentId ? nameOf(event.payload.thirdAgentId) : "ほかの誰か",
    streakDays: event.payload.streakDays ?? 3,
  };
  const actor = nameOf(event.actorAgentId);
  const target = event.targetAgentId ? nameOf(event.targetAgentId) : "";

  if (viewerAgentId === null) return phrases.asWorld ? phrases.asWorld(actor, target, extra) : null;
  if (event.actorAgentId === viewerAgentId) return phrases.asActor(target, extra);
  if (event.targetAgentId === viewerAgentId)
    return phrases.asTarget ? phrases.asTarget(actor, extra) : null;
  return null;
}
