import { cn } from "@auto-friend/ui/lib/utils";

// 枠線のカードではなく、見出しと余白だけで区切るフラットなセクション。
// flush を付けると中身の左右余白をなくし、リスト行を端から端まで使えるようにする。
export function Section({
  title,
  children,
  className,
  action,
  flush = false,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={cn("py-4", className)}>
      {(title || action) && (
        <div className="mb-2 flex items-center justify-between gap-3 px-4">
          {title && <h2 className="text-base font-bold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      <div className={cn(!flush && "px-4")}>{children}</div>
    </section>
  );
}

// アバター・本文・右側の要素を並べる、リストの1行
export function ListRow({
  leading,
  children,
  trailing,
  className,
}: {
  leading?: React.ReactNode;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-2.5", className)}>
      {leading}
      <div className="min-w-0 flex-1 text-sm leading-snug">{children}</div>
      {trailing}
    </div>
  );
}

// 「12」「いいね」のような、数字とラベルを縦に積んだ統計表示
export function Stat({
  value,
  label,
  testId,
}: {
  value: React.ReactNode;
  label: string;
  testId?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[17px] leading-tight font-bold tabular-nums" data-testid={testId}>
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}
