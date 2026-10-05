import { cn } from "@auto-friend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import type { Avatar } from "@auto-friend/avatar/avatar-schema";

import { AgentAvatar, EmojiAvatar } from "./agent-avatar";

// 本文中の相手の名前だけを太字にする（SNS の通知欄と同じ見せ方）
function emphasizeName(text: string, name?: string) {
  if (!name) return text;
  const index = text.indexOf(name);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold">{name}</span>
      {text.slice(index + name.length)}
    </>
  );
}

// 出来事の1行。相手がいればアバターと絵文字バッジ、いなければ絵文字の丸アイコンを出す。
// 大きな出来事はストーリーズ風のリングで目立たせる。
export function ActivityItem({
  emoji,
  text,
  time,
  counterpart,
  highlight = false,
  linkable = true,
}: {
  emoji: string;
  text: string;
  time: string;
  counterpart?: { id: string; displayName: string; avatar?: Avatar } | null;
  highlight?: boolean;
  // false にすると相手のページへのリンクにしない（紹介用のサンプル表示など）
  linkable?: boolean;
}) {
  const body = (
    <>
      {counterpart ? (
        <AgentAvatar
          id={counterpart.id}
          avatar={counterpart.avatar}
          size="md"
          ring={highlight}
          badge={emoji}
        />
      ) : (
        <EmojiAvatar
          emoji={emoji}
          size="md"
          className={cn("text-lg", highlight && "bg-brand-soft")}
        />
      )}
      <p className="min-w-0 flex-1 text-sm leading-snug">
        {emphasizeName(text, counterpart?.displayName)}{" "}
        <time className="whitespace-nowrap text-muted-foreground">{time}</time>
      </p>
    </>
  );

  const className = "flex items-center gap-3 px-4 py-2.5";
  return counterpart && linkable ? (
    <Link
      to="/agents/$agentId"
      params={{ agentId: counterpart.id }}
      className={cn(className, "transition-colors hover:bg-muted/60 active:bg-muted")}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
