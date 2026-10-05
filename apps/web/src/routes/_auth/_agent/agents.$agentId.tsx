import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AgentAvatar } from "@/components/agent-avatar";
import Loader from "@/components/loader";
import { ParameterBar } from "@/components/parameter-bar";
import { Section } from "@/components/section";
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
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Section>
        <div className="flex items-center gap-4">
          <AgentAvatar id={a.id} name={a.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            {a.isMine && <p className="text-xs text-pink-500">あなたのエージェント</p>}
            <h1 className="truncate text-xl font-bold">{a.displayName}</h1>
            <p className="text-xs text-muted-foreground">
              {a.age}歳 ・ {GENDER_LABELS[a.gender]} ・ {a.birthplace}出身
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl">{a.mood.emoji}</p>
            <p className="text-[10px] text-muted-foreground">最近の気分: {a.mood.label}</p>
          </div>
        </div>
        {a.myRelation && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-2 py-0.5">
              あなたのエージェントとは: {STATE_LABELS[a.myRelation.state]?.emoji}{" "}
              {STATE_LABELS[a.myRelation.state]?.label}
            </span>
            {a.myRelation.likedMe && (
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                いいねをくれた
              </span>
            )}
            {a.myRelation.iLiked && (
              <span className="rounded-full bg-muted px-2 py-0.5">いいね済み</span>
            )}
          </div>
        )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="プロフィール">
          <dl className="grid grid-cols-[5rem_1fr] gap-y-1 text-sm">
            <dt className="text-muted-foreground">学校</dt>
            <dd>{a.schoolType}</dd>
            <dt className="text-muted-foreground">部活</dt>
            <dd>{a.club}</dd>
            <dt className="text-muted-foreground">サークル</dt>
            <dd>{a.circle}</dd>
          </dl>
          <div className="mt-3 flex flex-wrap gap-1">
            {a.hobbies.map((hobby) => (
              <span key={hobby} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {hobby}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            最近ハマっていること: {a.recentInterests.join("、")}
          </p>
        </Section>

        <Section title="いまの恋愛">
          {a.partner ? (
            <Link
              to="/agents/$agentId"
              params={{ agentId: a.partner.id }}
              className="flex items-center gap-3 hover:underline"
            >
              <AgentAvatar id={a.partner.id} name={a.partner.displayName} size="sm" />
              <span className="text-sm">❤️ {a.partner.displayName}と付き合っています</span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">恋人はいません</p>
          )}
          <h3 className="mb-2 mt-4 text-xs font-semibold text-muted-foreground">
            親しいエージェント
          </h3>
          <ul className="space-y-2">
            {a.closeAgents.map((c) => (
              <li key={c.id}>
                <Link
                  to="/agents/$agentId"
                  params={{ agentId: c.id }}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <AgentAvatar id={c.id} name={c.displayName} size="sm" />
                  <span>{c.displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {STATE_LABELS[c.state]?.emoji} {STATE_LABELS[c.state]?.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="性格">
          <div className="space-y-2">
            {a.personality.map((p) => (
              <ParameterBar key={p.key} label={p.label} value={p.value} />
            ))}
          </div>
        </Section>
        {a.romance && (
          <Section title="恋愛傾向">
            <div className="space-y-2">
              {a.romance.map((p) => (
                <ParameterBar key={p.key} label={p.label} value={p.value} />
              ))}
            </div>
          </Section>
        )}
      </div>

      <Section title="最近の出来事">
        {a.recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">最近の大きな出来事はありません。</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {a.recentEvents.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  {e.day}日目 {formatMinute(e.minuteOfDay)}
                </span>
                <span>{e.text}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </main>
  );
}
