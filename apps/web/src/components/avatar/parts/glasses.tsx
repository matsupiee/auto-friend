import type { GlassesStyleId } from "@auto-friend/avatar/avatar-parts";

// メガネのレンズ1枚ぶん。向かって左のレンズを原点中心に描き、右は描画側で左右反転する。
// halfWidth はレンズの半幅で、ブリッジとつるの位置を決めるのに使う。
type Lens = { halfWidth: number; render: (color: string) => React.ReactNode };

const GLASS = "rgba(255, 255, 255, 0.22)";

export const glassesLenses: Record<GlassesStyleId, Lens | null> = {
  none: null,
  round: {
    halfWidth: 13,
    render: (color) => <circle r={13} fill={GLASS} stroke={color} strokeWidth={2.4} />,
  },
  square: {
    halfWidth: 14,
    render: (color) => (
      <rect
        x={-14}
        y={-10.5}
        width={28}
        height={21}
        rx={4}
        fill={GLASS}
        stroke={color}
        strokeWidth={2.4}
      />
    ),
  },
  oval: {
    halfWidth: 14,
    render: (color) => <ellipse rx={14} ry={11} fill={GLASS} stroke={color} strokeWidth={2.4} />,
  },
  halfRim: {
    halfWidth: 14,
    render: (color) => (
      <>
        <path
          d="M-14 -1 C-14 11 14 11 14 -1"
          fill={GLASS}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.55}
        />
        <path
          d="M-14 -1 L-14 -6 C-14 -9.6 14 -9.6 14 -6 L14 -1"
          fill="none"
          stroke={color}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
      </>
    ),
  },
  big: {
    halfWidth: 16,
    render: (color) => (
      <rect
        x={-16}
        y={-14}
        width={32}
        height={28}
        rx={10}
        fill={GLASS}
        stroke={color}
        strokeWidth={2.6}
      />
    ),
  },
  sunglasses: {
    halfWidth: 15,
    render: (color) => (
      <>
        <path
          d="M-15 -8 L15 -8 C15 5 9.4 10.6 0 10.6 C-9.4 10.6 -15 5 -15 -8 Z"
          fill="#1f2328"
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path
          d="M-10 -4 L-5 -4"
          stroke="white"
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    ),
  },
};
