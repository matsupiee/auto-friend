import { cn } from "@auto-friend/ui/lib/utils";

function hueOf(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % 360;
}

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

// 画像の代わりに、名前の頭文字と id から決まる色でアバターを描く。
// ring を付けるとストーリーズ風のグラデーションリング、badge を付けると右下に小さなバッジを重ねる。
export function AgentAvatar({
  id,
  name,
  size = "md",
  ring = false,
  badge,
  className,
}: {
  id: string;
  name: string;
  size?: keyof typeof SIZES;
  ring?: boolean;
  badge?: React.ReactNode;
  className?: string;
}) {
  const hue = hueOf(id);
  const face = (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        SIZES[size],
      )}
      style={{
        background: `linear-gradient(140deg, oklch(0.8 0.11 ${hue}), oklch(0.62 0.15 ${(hue + 35) % 360}))`,
      }}
    >
      {Array.from(name)[0]?.toUpperCase()}
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
