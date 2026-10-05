import { cn } from "@auto-friend/ui/lib/utils";

function hueOf(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % 360;
}

// 画像の代わりに、名前の頭文字と id から決まる色でアバターを描く
export function AgentAvatar({
  id,
  name,
  size = "md",
  className,
}: {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hue = hueOf(id);
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-16 text-2xl",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 70% 50%))`,
      }}
    >
      {Array.from(name)[0]?.toUpperCase()}
    </div>
  );
}
