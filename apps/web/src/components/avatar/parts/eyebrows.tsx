import type { EyebrowStyleId } from "@auto-friend/avatar/avatar-parts";

// 眉パーツ。向かって左の眉を原点中心に描く（眉頭が +x）。右の眉は描画側で左右反転する。
function stroke(d: string, width: number) {
  return ({ color }: { color: string }) => (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
  );
}

const NATURAL = "M-11 2.5 C-5 -3.5 4 -4 11 -0.5";

export const eyebrows: Record<EyebrowStyleId, (props: { color: string }) => React.ReactNode> = {
  natural: stroke(NATURAL, 3.4),
  thin: stroke(NATURAL, 1.8),
  thick: stroke(NATURAL, 6),
  straight: stroke("M-11 0 L11 0", 3.6),
  arched: stroke("M-11 4 C-6 -6 4 -6 11 0", 3.2),
  angry: stroke("M-11 -4 C-3 -2 4 1 11 4", 3.8),
  worried: stroke("M-11 3 C-3 2 4 -1 11 -5", 3.4),
  short: ({ color }) => <ellipse cx={4} rx={4.5} ry={3} fill={color} />,
  bushy: ({ color }) => (
    <path d="M-12 3 C-9 -6 6 -8 12 -3 C11 1 9 3 6 2 C0 0 -6 1 -12 3 Z" fill={color} />
  ),
};
