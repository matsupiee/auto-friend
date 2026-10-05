import type { GlassesStyleId } from "@auto-friend/avatar/avatar-parts";

// メガネのレンズ1枚ぶん。向かって左のレンズを原点中心に描き、右は描画側で左右反転する。
// halfWidth はレンズの半幅で、ブリッジとつるの位置を決めるのに使う。
type Lens = { halfWidth: number; render: (color: string) => React.ReactNode };

const GLASS = "rgba(255, 255, 255, 0.18)";

export const glassesLenses: Record<GlassesStyleId, Lens | null> = {
  none: null,
  round: {
    halfWidth: 11,
    render: (color) => <circle r={11} fill={GLASS} stroke={color} strokeWidth={2.2} />,
  },
  square: {
    halfWidth: 12,
    render: (color) => (
      <rect
        x={-12}
        y={-9}
        width={24}
        height={18}
        rx={3}
        fill={GLASS}
        stroke={color}
        strokeWidth={2.4}
      />
    ),
  },
  oval: {
    halfWidth: 12,
    render: (color) => <ellipse rx={12} ry={9} fill={GLASS} stroke={color} strokeWidth={2.2} />,
  },
  halfRim: {
    halfWidth: 12,
    render: (color) => (
      <>
        <path
          d="M-12 -1 C-12 9 12 9 12 -1"
          fill={GLASS}
          stroke={color}
          strokeWidth={0.9}
          strokeOpacity={0.6}
        />
        <path
          d="M-12 -1 L-12 -5 C-12 -8 12 -8 12 -5 L12 -1"
          fill="none"
          stroke={color}
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
      </>
    ),
  },
  big: {
    halfWidth: 14,
    render: (color) => (
      <rect
        x={-14}
        y={-12}
        width={28}
        height={24}
        rx={8}
        fill={GLASS}
        stroke={color}
        strokeWidth={2.6}
      />
    ),
  },
  sunglasses: {
    halfWidth: 13,
    render: (color) => (
      <path
        d="M-13 -7 L13 -7 C13 4 8 9 0 9 C-8 9 -13 4 -13 -7 Z"
        fill="#1f2328"
        fillOpacity={0.9}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    ),
  },
};
