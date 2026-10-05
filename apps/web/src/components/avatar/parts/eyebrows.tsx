import type { EyebrowStyleId } from "@auto-friend/avatar/avatar-parts";

// 眉パーツ。向かって左の眉を原点中心に描く（眉頭が +x）。右の眉は描画側で左右反転する。
// 細めで短く、先を丸くしてやわらかい印象にする。
function stroke(d: string, width: number) {
  return ({ color }: { color: string }) => (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
  );
}

const NATURAL = "M-9 2 C-4.4 -2.8 3.6 -3.2 9 -0.4";

export const eyebrows: Record<EyebrowStyleId, (props: { color: string }) => React.ReactNode> = {
  natural: stroke(NATURAL, 2.8),
  thin: stroke(NATURAL, 1.7),
  thick: stroke(NATURAL, 4.4),
  straight: stroke("M-9 0 L9 0", 3),
  arched: stroke("M-9 3.4 C-5 -5 3.6 -5 9 0", 2.6),
  angry: stroke("M-9 -3.4 C-2.4 -1.6 3.4 0.8 9 3.4", 3.2),
  worried: stroke("M-9 2.6 C-2.4 1.6 3.4 -0.8 9 -4.2", 2.8),
  short: ({ color }) => <ellipse cx={3.4} rx={3.8} ry={2.6} fill={color} />,
  bushy: ({ color }) => (
    <path
      d="M-10 2.6 C-7.6 -5 5 -6.8 10 -2.6 C9 0.8 7.6 2.6 5 1.8 C0 0 -5 0.8 -10 2.6 Z"
      fill={color}
    />
  ),
};
