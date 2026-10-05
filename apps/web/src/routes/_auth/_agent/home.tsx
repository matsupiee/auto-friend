import { Button } from "@auto-friend/ui/components/button";
import { cn } from "@auto-friend/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { AgentAvatar } from "@/components/agent-avatar";
import Loader from "@/components/loader";
import { Section } from "@/components/section";
import { EVENT_EMOJI, formatMinute } from "@/lib/agent-display";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/_agent/home")({
  component: HomePage,
  validateSearch: z.object({ day: z.number().int().optional() }),
});

function HomePage() {
  const { day } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const mine = useQuery(trpc.agent.getMine.queryOptions());
  const feed = useQuery(trpc.feed.getDay.queryOptions({ day }));
  const world = useQuery(trpc.world.getStatus.queryOptions());
  const [showAll, setShowAll] = useState(false);

  const advance = useMutation(
    trpc.world.advanceDay.mutationOptions({
      onSuccess: async (result) => {
        await queryClient.invalidateQueries();
        await navigate({ search: { day: result.day } });
        toast.success(`${result.day}日目になりました`);
        for (const text of result.notifications) toast(text, { icon: "🔔", duration: 8000 });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  if (!mine.data || !feed.data) return <Loader />;
  const me = mine.data;
  const f = feed.data;
  const days = Array.from({ length: f.currentDay - f.firstDay + 1 }, (_, i) => f.firstDay + i);
  const highlights = f.events.filter((e) => e.importance >= 2);
  // いいねは数が多いので、まとめ表示にする
  const timeline = f.events.filter((e) => showAll || e.type !== "liked");
  const hiddenLikes = f.events.length - timeline.length;
  const isToday = f.day === f.currentDay;

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Section>
        <div className="flex items-center gap-4">
          <Link to="/agents/$agentId" params={{ agentId: me.id }}>
            <AgentAvatar id={me.id} name={me.displayName} size="lg" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">あなたのエージェント</p>
            <p className="truncate text-lg font-bold">{me.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {me.partner ? (
                <>
                  ❤️ {me.partner.displayName}と{me.partner.state === "partner" ? "恋人" : "交際中"}
                </>
              ) : (
                "恋人はいません"
              )}
              {" ・ "}世界の{me.currentDay}日目
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pink-500" data-testid="today-likes">
              ♥ {me.todayLikeCount}
            </p>
            <p className="text-[10px] text-muted-foreground">
              今日のいいね（累計 {me.totalLikeCount}）
            </p>
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => navigate({ search: { day: d } })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs",
              d === f.day
                ? "border-pink-500 bg-pink-500 text-white"
                : "bg-background hover:bg-muted",
            )}
          >
            {d === f.currentDay ? "今日" : `${d}日目`}
          </button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto shrink-0 rounded-full"
          disabled={advance.isPending}
          onClick={() => advance.mutate()}
        >
          {advance.isPending ? "世界が動いています..." : "次の日へ進める ▶"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "いいね", value: f.stats.likes, emoji: "👍" },
          { label: "新しい出会い", value: f.stats.newAcquaintances, emoji: "🤝" },
          { label: "会話", value: f.stats.conversations, emoji: "💬" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card p-3">
            <p className="text-lg font-bold">
              {stat.emoji} {stat.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {highlights.length > 0 && (
        <Section
          title="🔔 大きな出来事"
          className="border-pink-300 bg-pink-50/60 dark:border-pink-800 dark:bg-pink-950/30"
        >
          <ul className="space-y-2">
            {highlights.map((e) => (
              <li key={e.id} className="flex gap-2 text-sm font-medium">
                <span>{EVENT_EMOJI[e.type]}</span>
                <span>{e.text}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title={isToday ? "今日、あなたのエージェントに起きたこと" : `${f.day}日目に起きたこと`}
      >
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">この日は何も起きませんでした。</p>
        ) : (
          <ul className="space-y-3" data-testid="timeline">
            {timeline.map((e) => (
              <li
                key={e.id}
                className={cn(
                  "flex items-start gap-3 text-sm",
                  e.importance >= 2 && "font-semibold",
                )}
              >
                <span className="w-11 shrink-0 tabular-nums text-xs leading-5 text-muted-foreground">
                  {formatMinute(e.minuteOfDay)}
                </span>
                <span className="leading-5">{EVENT_EMOJI[e.type]}</span>
                <span className="flex-1 leading-5">
                  {e.text}
                  {e.counterpart && (
                    <Link
                      to="/agents/$agentId"
                      params={{ agentId: e.counterpart.id }}
                      className="ml-2 text-xs text-pink-600 hover:underline"
                    >
                      見る
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {hiddenLikes > 0 && (
          <button
            type="button"
            className="mt-3 text-xs text-pink-600 hover:underline"
            onClick={() => setShowAll(true)}
          >
            ほか、いいね {hiddenLikes} 件をすべて表示
          </button>
        )}
      </Section>

      <Section title={`📔 ${me.displayName}の日記`}>
        <div className="space-y-1 text-sm leading-relaxed" data-testid="diary">
          {f.diary.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </Section>

      {world.data && (
        <Section
          title="🌏 世界のようす"
          action={
            <span className="text-xs text-muted-foreground">
              {world.data.population}人が暮らす ・ {world.data.coupleCount}組のカップル
            </span>
          }
        >
          {world.data.headlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ大きなニュースはありません。</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {world.data.headlines.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">
                    {h.day}日目 {formatMinute(h.minuteOfDay)}
                  </span>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </main>
  );
}
