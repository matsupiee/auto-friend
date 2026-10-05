import { Button, buttonVariants } from "@auto-friend/ui/components/button";
import { cn } from "@auto-friend/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Heart, Loader2, MessageCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { ActivityItem } from "@/components/activity-item";
import { AgentAvatar, EmojiAvatar } from "@/components/agent-avatar";
import { PageContainer } from "@/components/app-shell";
import Loader from "@/components/loader";
import { Section, Stat } from "@/components/section";
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
    <PageContainer>
      {/* プロフィールヘッダー */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-6">
          <Link to="/agents/$agentId" params={{ agentId: me.id }} aria-label="プロフィールを見る">
            <AgentAvatar id={me.id} avatar={me.avatar} size="xl" ring />
          </Link>
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Stat value={me.todayLikeCount} label="今日のいいね" testId="today-likes" />
            <Stat value={me.totalLikeCount} label="累計いいね" />
          </div>
        </div>
        <div className="mt-3 space-y-0.5">
          <p className="text-[15px] font-semibold">{me.displayName}</p>
          <p className="text-[13px] text-muted-foreground">あなたのエージェント</p>
          <p className="text-sm">
            {me.partner ? (
              <>
                <Heart className="mr-1 inline size-3.5 -translate-y-px fill-brand text-brand" />
                {me.partner.displayName}と{me.partner.state === "partner" ? "恋人" : "交際中"}
              </>
            ) : (
              "恋人はいません"
            )}
            <span className="text-muted-foreground"> ・ 世界の{me.currentDay}日目</span>
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            to="/agents/$agentId"
            params={{ agentId: me.id }}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "flex-1")}
          >
            プロフィール
          </Link>
          <Button
            size="sm"
            className="flex-1"
            disabled={advance.isPending}
            onClick={() => advance.mutate()}
          >
            {advance.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                世界が動いています...
              </>
            ) : (
              "次の日へ進める"
            )}
          </Button>
        </div>
      </div>

      {/* 日付タブ */}
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur-xl md:top-0">
        <div className="scrollbar-none flex overflow-x-auto px-2">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              aria-current={d === f.day ? "date" : undefined}
              onClick={() => navigate({ search: { day: d } })}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors",
                d === f.day ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {d === f.currentDay ? "今日" : `${d}日目`}
              {d === f.day && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* その日の数字 */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[
          { label: "いいね", value: f.stats.likes, icon: Heart },
          { label: "新しい出会い", value: f.stats.newAcquaintances, icon: UserPlus },
          { label: "会話", value: f.stats.conversations, icon: MessageCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-muted px-3 py-3">
            <Icon className="size-4 text-muted-foreground" strokeWidth={2} />
            <p className="mt-2 text-xl leading-none font-bold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {highlights.length > 0 && (
        <Section title="大きな出来事" flush className="pb-0">
          <div>
            {highlights.map((e) => (
              <ActivityItem
                key={e.id}
                emoji={EVENT_EMOJI[e.type] ?? "✨"}
                text={e.text}
                time={formatMinute(e.minuteOfDay)}
                counterpart={e.counterpart}
                highlight
              />
            ))}
          </div>
        </Section>
      )}

      <Section
        title={isToday ? "今日、あなたのエージェントに起きたこと" : `${f.day}日目に起きたこと`}
        flush
      >
        {timeline.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            この日は何も起きませんでした。
          </p>
        ) : (
          <div data-testid="timeline">
            {timeline.map((e) => (
              <ActivityItem
                key={e.id}
                emoji={EVENT_EMOJI[e.type] ?? "✨"}
                text={e.text}
                time={formatMinute(e.minuteOfDay)}
                counterpart={e.counterpart}
                highlight={e.importance >= 2}
              />
            ))}
          </div>
        )}
        {hiddenLikes > 0 && (
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60 active:bg-muted"
            onClick={() => setShowAll(true)}
          >
            <EmojiAvatar emoji="👍" size="md" className="text-lg" />
            <span className="flex-1 text-sm">ほか、いいね {hiddenLikes} 件をすべて表示</span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        )}
      </Section>

      <Section title={`${me.displayName}の日記`}>
        <div
          className="space-y-1.5 rounded-2xl bg-muted px-4 py-3.5 text-[15px] leading-relaxed"
          data-testid="diary"
        >
          {f.diary.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </Section>

      {world.data && (
        <Section
          title="世界のようす"
          flush
          action={
            <span className="text-xs text-muted-foreground">
              {world.data.population}人 ・ {world.data.coupleCount}組のカップル
            </span>
          }
        >
          {world.data.headlines.length === 0 ? (
            <p className="px-4 text-sm text-muted-foreground">まだ大きなニュースはありません。</p>
          ) : (
            <div>
              {world.data.headlines.map((h) => (
                <ActivityItem
                  key={h.id}
                  emoji="🌏"
                  text={h.text}
                  time={`${h.day}日目 ${formatMinute(h.minuteOfDay)}`}
                />
              ))}
            </div>
          )}
        </Section>
      )}
    </PageContainer>
  );
}
