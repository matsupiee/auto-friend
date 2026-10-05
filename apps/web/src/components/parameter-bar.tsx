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
    <div className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-right tabular-nums text-muted-foreground">{percent}</span>
    </div>
  );
}
