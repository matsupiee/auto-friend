import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AgentAvatar } from "@/components/agent-avatar";
import { PageContainer } from "@/components/app-shell";
import Loader from "@/components/loader";
import { Section } from "@/components/section";
import { GROUP_LABELS, STATE_LABELS } from "@/lib/agent-display";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/_agent/relationships")({
  component: RelationshipsPage,
});

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="h-1 w-10 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RelationshipsPage() {
  const list = useQuery(trpc.relationship.list.queryOptions());
  if (!list.data) return <Loader />;
  const total = list.data.groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <PageContainer>
      <div className="px-4 pt-5 pb-1">
        <h1 className="text-2xl font-bold tracking-tight">関係</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          あなたのエージェントが知っている {total} 人
        </p>
      </div>

      {list.data.admirers.length > 0 && (
        <Section
          title="いいねをくれた人"
          flush
          action={
            <span className="text-xs text-muted-foreground">
              まだ会っていない・{list.data.admirers.length}人
            </span>
          }
        >
          <div
            className="scrollbar-none flex gap-4 overflow-x-auto px-4 pb-1"
            data-testid="admirers"
          >
            {list.data.admirers.map((admirer) => (
              <Link
                key={admirer.id}
                to="/agents/$agentId"
                params={{ agentId: admirer.id }}
                className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
              >
                <AgentAvatar id={admirer.id} name={admirer.displayName} size="lg" ring />
                <span className="w-full truncate text-center text-xs">{admirer.displayName}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {list.data.groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <Section
            key={group.key}
            flush
            title={
              <>
                {GROUP_LABELS[group.key]}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  {group.items.length}
                </span>
              </>
            }
          >
            <ul data-testid={`group-${group.key}`}>
              {group.items.map((item) => (
                <li key={item.agent.id}>
                  <Link
                    to="/agents/$agentId"
                    params={{ agentId: item.agent.id }}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60 active:bg-muted"
                  >
                    <AgentAvatar
                      id={item.agent.id}
                      name={item.agent.displayName}
                      size="lg"
                      badge={STATE_LABELS[item.state]?.emoji}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.agent.displayName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {STATE_LABELS[item.state]?.label}
                        {item.likedMe && " ・ いいねをくれた"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                        <MiniBar label="好意" value={item.attraction} />
                        <MiniBar label="信頼" value={item.trust} />
                        <MiniBar label="親密" value={item.familiarity} />
                      </div>
                    </div>
                    {item.interactionStreak >= 2 && (
                      <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold">
                        🔥 {item.interactionStreak}日連続
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))}
    </PageContainer>
  );
}
