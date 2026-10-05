import { colorHex, favoriteColorOptions } from "@auto-friend/avatar/avatar-parts";
import type { Avatar } from "@auto-friend/avatar/avatar-schema";
import { generateAvatarFromSeed } from "@auto-friend/avatar/generate-avatar-from-seed";
import { cn } from "@auto-friend/ui/lib/utils";

import { AvatarFigure } from "./avatar/avatar-figure";

const SIZES = {
  xs: "size-7 text-[11px]",
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-xl",
  xl: "size-20 text-3xl md:size-24",
} as const;

const BADGE_SIZES = {
  xs: "size-4 text-[9px]",
  sm: "size-[18px] text-[10px]",
  md: "size-5 text-[11px]",
  lg: "size-6 text-xs",
  xl: "size-7 text-sm",
} as const;

// エージェントの似顔絵（胸から上）を丸く切り抜いて描く。背景は好きな色をうすくしたもの。
// avatar を渡さないとき（紹介用のサンプルなど）は、id から決まる見た目にする。
// ring を付けるとストーリーズ風のグラデーションリング、badge を付けると右下に小さなバッジを重ねる。
export function AgentAvatar({
  id,
  avatar,
  size = "md",
  ring = false,
  badge,
  className,
}: {
  id: string;
  avatar?: Avatar;
  size?: keyof typeof SIZES;
  ring?: boolean;
  badge?: React.ReactNode;
  className?: string;
}) {
  const look = avatar ?? generateAvatarFromSeed(id);
  const tint = colorHex(favoriteColorOptions, look.favoriteColor);
  const face = (
    <div
      aria-hidden
      className={cn("shrink-0 overflow-hidden rounded-full select-none", SIZES[size])}
      style={{ background: `color-mix(in oklch, ${tint} 22%, white)` }}
    >
      <AvatarFigure avatar={look} viewBox="8 14 184 184" className="size-full" />
    </div>
  );

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {ring ? (
        <div className="story-ring rounded-full p-[2px]">
          <div className="rounded-full bg-background p-[2px]">{face}</div>
        </div>
      ) : (
        face
      )}
      {badge && (
        <span
          aria-hidden
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full bg-background leading-none ring-2 ring-background",
            BADGE_SIZES[size],
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// 相手のいない出来事（いいねの通知など）に使う、絵文字だけの丸アイコン
export function EmojiAvatar({
  emoji,
  size = "md",
  className,
}: {
  emoji: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted leading-none",
        SIZES[size],
        className,
      )}
    >
      {emoji}
    </div>
  );
}
