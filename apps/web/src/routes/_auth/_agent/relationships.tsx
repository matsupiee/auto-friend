import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AgentAvatar } from "@/components/agent-avatar";
import Loader from "@/components/loader";
import { Section } from "@/components/section";
import { GROUP_LABELS, STATE_LABELS } from "@/lib/agent-display";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/_agent/relationships")({
  component: RelationshipsPage,
});

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-8 text-[10px] text-muted-foreground">{label}</span>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-pink-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RelationshipsPage() {
  const list = useQuery(trpc.relationship.list.queryOptions());
  if (!list.data) return <Loader />;
  const total = list.data.groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold">関係</h1>
        <p className="text-xs text-muted-foreground">あなたのエージェントが知っている {total} 人</p>
      </div>

      {list.data.groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <Section key={group.key} title={`${GROUP_LABELS[group.key]}（${group.items.length}）`}>
            <ul className="divide-y" data-testid={`group-${group.key}`}>
              {group.items.map((item) => (
                <li key={item.agent.id}>
                  <Link
                    to="/agents/$agentId"
                    params={{ agentId: item.agent.id }}
                    className="flex items-center gap-3 py-2 hover:bg-muted/50"
                  >
                    <AgentAvatar id={item.agent.id} name={item.agent.displayName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.agent.displayName}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {STATE_LABELS[item.state]?.emoji} {STATE_LABELS[item.state]?.label}
                        </span>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <MiniBar label="好意" value={item.attraction} />
                        <MiniBar label="信頼" value={item.trust} />
                        <MiniBar label="親密" value={item.familiarity} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[10px]">
                      {item.interactionStreak >= 2 && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          🔥 {item.interactionStreak}日連続
                        </span>
                      )}
                      {item.likedMe && (
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                          いいねをくれた
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))}

      {list.data.admirers.length > 0 && (
        <Section title={`👍 いいねをくれた人（まだ会っていない・${list.data.admirers.length}人）`}>
          <div className="flex flex-wrap gap-3" data-testid="admirers">
            {list.data.admirers.map((admirer) => (
              <Link
                key={admirer.id}
                to="/agents/$agentId"
                params={{ agentId: admirer.id }}
                className="flex w-16 flex-col items-center gap-1 text-center"
              >
                <AgentAvatar id={admirer.id} name={admirer.displayName} size="sm" />
                <span className="w-full truncate text-[10px]">{admirer.displayName}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
