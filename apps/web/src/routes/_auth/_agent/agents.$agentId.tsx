import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Heart } from "lucide-react";

import { AgentAvatar, EmojiAvatar } from "@/components/agent-avatar";
import { PageContainer } from "@/components/app-shell";
import Loader from "@/components/loader";
import { ParameterBar } from "@/components/parameter-bar";
import { Section, Stat } from "@/components/section";
import { GENDER_LABELS, STATE_LABELS, formatMinute } from "@/lib/agent-display";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/_agent/agents/$agentId")({
  component: AgentPage,
});

function AgentPage() {
  const { agentId } = Route.useParams();
  const detail = useQuery(trpc.agent.get.queryOptions({ agentId }));
  if (!detail.data) return <Loader />;
  const a = detail.data;

  return (
    <PageContainer>
      {/* プロフィールヘッダー */}
      <div className="border-b px-4 pt-5 pb-4">
        <div className="flex items-center gap-6">
          <AgentAvatar id={a.id} name={a.displayName} size="xl" ring />
          <div className="grid flex-1 grid-cols-3 gap-1">
            <Stat value={a.age} label="歳" />
            <Stat value={a.closeAgents.length} label="親しい人" />
            <Stat value={a.mood.emoji} label="気分" />
          </div>
        </div>
        <div className="mt-3 space-y-0.5">
          <h1 className="text-[15px] font-semibold">{a.displayName}</h1>
          {a.isMine && <p className="text-[13px] text-muted-foreground">あなたのエージェント</p>}
          <p className="text-sm">
            {GENDER_LABELS[a.gender]} ・ {a.birthplace}出身
          </p>
          <p className="text-sm">最近の気分: {a.mood.label}</p>
          {a.recentInterests.length > 0 && (
            <p className="text-sm text-muted-foreground">
              最近ハマっていること: {a.recentInterests.join("、")}
            </p>
          )}
        </div>
        {a.myRelation && (
          <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-semibold">
            <span className="flex h-8 items-center rounded-lg bg-secondary px-3">
              あなたのエージェントとは: {STATE_LABELS[a.myRelation.state]?.emoji}{" "}
              {STATE_LABELS[a.myRelation.state]?.label}
            </span>
            {a.myRelation.likedMe && (
              <span className="flex h-8 items-center gap-1 rounded-lg bg-brand-soft px-3 text-brand">
                <Heart className="size-3.5 fill-current" />
                いいねをくれた
              </span>
            )}
            {a.myRelation.iLiked && (
              <span className="flex h-8 items-center rounded-lg bg-secondary px-3 text-muted-foreground">
                いいね済み
              </span>
            )}
          </div>
        )}
        <div className="scrollbar-none -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4">
          {a.hobbies.map((hobby) => (
            <span
              key={hobby}
              className="shrink-0 rounded-full border px-3 py-1 text-[13px] font-medium"
            >
              {hobby}
            </span>
          ))}
        </div>
      </div>

      <Section title="プロフィール">
        <dl className="divide-y overflow-hidden rounded-2xl bg-muted text-sm">
          {[
            { label: "学校", value: a.schoolType },
            { label: "部活", value: a.club },
            { label: "サークル", value: a.circle },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="いまの恋愛" flush>
        {a.partner ? (
          <Link
            to="/agents/$agentId"
            params={{ agentId: a.partner.id }}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60"
          >
            <AgentAvatar id={a.partner.id} name={a.partner.displayName} size="md" ring badge="❤️" />
            <span className="flex-1 text-sm">
              <span className="font-semibold">{a.partner.displayName}</span>と付き合っています
            </span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ) : (
          <p className="px-4 pb-1 text-sm text-muted-foreground">恋人はいません</p>
        )}
        {a.closeAgents.length > 0 && (
          <>
            <h3 className="px-4 pt-4 pb-1 text-[13px] font-semibold text-muted-foreground">
              親しいエージェント
            </h3>
            <ul>
              {a.closeAgents.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/agents/$agentId"
                    params={{ agentId: c.id }}
                    className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/60 active:bg-muted"
                  >
                    <AgentAvatar id={c.id} name={c.displayName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.displayName}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {STATE_LABELS[c.state]?.emoji} {STATE_LABELS[c.state]?.label}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <div className="grid md:grid-cols-2">
        <Section title="性格">
          <div className="space-y-3">
            {a.personality.map((p) => (
              <ParameterBar key={p.key} label={p.label} value={p.value} />
            ))}
          </div>
        </Section>
        {a.romance && (
          <Section title="恋愛傾向">
            <div className="space-y-3">
              {a.romance.map((p) => (
                <ParameterBar key={p.key} label={p.label} value={p.value} />
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* 自分のエージェントの出来事はホームで日ごとに見られるので、ここでは重ねて出さない */}
      {a.isMine ? (
        <Section title="毎日の出来事" flush>
          <Link
            to="/home"
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60 active:bg-muted"
          >
            <EmojiAvatar emoji="📅" size="md" className="text-lg" />
            <span className="flex-1 text-sm">1日ごとの出来事と日記はホームで見られます</span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        </Section>
      ) : (
        <Section title="最近の出来事" flush>
          {a.recentEvents.length === 0 ? (
            <p className="px-4 text-sm text-muted-foreground">最近の大きな出来事はありません。</p>
          ) : (
            <ul>
              {a.recentEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                  <EmojiAvatar emoji="✨" size="md" className="text-lg" />
                  <p className="min-w-0 flex-1 text-sm leading-snug">
                    {e.text}{" "}
                    <time className="whitespace-nowrap text-muted-foreground">
                      {e.day}日目 {formatMinute(e.minuteOfDay)}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </PageContainer>
  );
}
