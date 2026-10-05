import type { NoseStyleId } from "@auto-friend/avatar/avatar-parts";

// 鼻パーツ。原点中心に描く。どの肌色にもなじむよう、半透明の茶色で影をつける。
const SHADE = "rgba(120, 60, 40, 0.5)";
const SOFT = "rgba(120, 60, 40, 0.18)";

function line(d: string) {
  return () => (
    <path
      d={d}
      fill="none"
      stroke={SHADE}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export const noses: Record<NoseStyleId, () => React.ReactNode> = {
  dot: () => <ellipse rx={2.6} ry={2} fill={SHADE} />,
  curve: line("M-4 1 C-2 4.5 2 4.5 4 1"),
  hook: line("M1.5 -9 L-3.5 3 C-1 4.5 2 4.5 4 2.5"),
  button: () => (
    <>
      <circle r={5.5} fill={SOFT} />
      <circle cx={-2.3} cy={2} r={1.1} fill={SHADE} />
      <circle cx={2.3} cy={2} r={1.1} fill={SHADE} />
    </>
  ),
  triangle: line("M0 -7 L-4.5 3 L4.5 3"),
  tall: line("M0.5 -14 C1 -6 4 -1 4 2 C4 4.5 1 5 -2 3.5"),
};
