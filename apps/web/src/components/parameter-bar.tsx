// 0〜1 または 0〜100 の値を横棒で見せる
export function ParameterBar({
  label,
  value,
  max = 1,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const percent = Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{percent}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/80" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
