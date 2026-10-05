import type { NoseStyleId } from "@auto-friend/avatar/avatar-parts";

// 鼻パーツ。原点中心に描く。かわいく見えるよう小さく控えめにし、半透明の茶色で影をつける。
const SHADE = "rgba(150, 80, 60, 0.55)";
const SOFT = "rgba(150, 80, 60, 0.16)";

function line(d: string) {
  return () => (
    <path
      d={d}
      fill="none"
      stroke={SHADE}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export const noses: Record<NoseStyleId, () => React.ReactNode> = {
  dot: () => <ellipse rx={1.8} ry={1.3} fill={SHADE} />,
  curve: line("M-2.8 0.4 C-1.2 2.6 1.2 2.6 2.8 0.4"),
  hook: line("M1 -6 L-2.2 2 C-0.4 3.2 1.4 3 2.8 1.8"),
  button: () => (
    <>
      <circle r={4} fill={SOFT} />
      <circle cx={-1.6} cy={1.6} r={0.9} fill={SHADE} />
      <circle cx={1.6} cy={1.6} r={0.9} fill={SHADE} />
    </>
  ),
  triangle: line("M0 -5 L-3 2.4 L3 2.4"),
  tall: line("M0.4 -10 C0.8 -4 3 -1 3 1.6 C3 3.4 0.8 3.8 -1.6 2.6"),
};
