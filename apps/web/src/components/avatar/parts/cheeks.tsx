import type { CheekId } from "@auto-friend/avatar/avatar-parts";

// 頬のパーツ。向かって左の頬を原点中心に描き、右は描画側で左右反転する。
// blush は描画側で用意するぼかしのグラデーション（blushFill）で塗る。
type CheekProps = { blushFill: string };

export const cheeks: Record<CheekId, ((props: CheekProps) => React.ReactNode) | null> = {
  none: null,
  blush: ({ blushFill }) => <ellipse rx={13} ry={8} fill={blushFill} />,
  heart: ({ blushFill }) => (
    <>
      <ellipse rx={10} ry={6.4} fill={blushFill} />
      <path
        d="M0 3.6 C-5 0 -5.4 -3.6 -2.6 -4 C-1.2 -4.2 -0.4 -3.2 0 -2.2 C0.4 -3.2 1.2 -4.2 2.6 -4 C5.4 -3.6 5 0 0 3.6 Z"
        fill="#ff7f9c"
        fillOpacity={0.75}
      />
    </>
  ),
  freckles: () => (
    <g fill="#c49a85" fillOpacity={0.6}>
      <circle cx={-3.6} cy={-1.4} r={0.8} />
      <circle cx={0.4} cy={-2.4} r={0.8} />
      <circle cx={3.6} cy={-0.6} r={0.8} />
      <circle cx={-0.8} cy={1.8} r={0.8} />
    </g>
  ),
  shy: ({ blushFill }) => (
    <>
      <ellipse rx={11} ry={6.6} fill={blushFill} />
      <path
        d="M-5.6 2.6 L-3 -2.6 M-1 2.6 L1.6 -2.6 M3.6 2.6 L6.2 -2.6"
        stroke="#e65f78"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </>
  ),
  tired: () => (
    <path
      d="M-6 -10 C-3 -7.4 3 -7.4 6 -10"
      fill="none"
      stroke="rgba(110, 70, 110, 0.38)"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  ),
};
