import type { CheekId } from "@auto-friend/avatar/avatar-parts";

// 頬のパーツ。向かって左の頬を原点中心に描き、右は描画側で左右反転する。
export const cheeks: Record<CheekId, (() => React.ReactNode) | null> = {
  none: null,
  blush: () => <ellipse rx={9} ry={5.5} fill="#ff6f86" fillOpacity={0.32} />,
  freckles: () => (
    <g fill="rgba(140, 80, 50, 0.55)">
      <circle cx={-5} cy={-2} r={1.1} />
      <circle cx={0} cy={-3} r={1.1} />
      <circle cx={4} cy={-1} r={1.1} />
      <circle cx={-2} cy={2} r={1.1} />
      <circle cx={3} cy={3} r={1.1} />
    </g>
  ),
  shy: () => (
    <>
      <ellipse rx={9} ry={5} fill="#ff6f86" fillOpacity={0.22} />
      <path
        d="M-6 3 L-3 -3 M-1 3 L2 -3 M4 3 L7 -3"
        stroke="#e2667a"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </>
  ),
  tired: () => (
    <path
      d="M-6 -9 C-3 -6 3 -6 6 -9"
      fill="none"
      stroke="rgba(90, 60, 90, 0.4)"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  ),
};
