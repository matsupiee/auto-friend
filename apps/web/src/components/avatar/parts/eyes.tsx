import type { EyeStyleId } from "@auto-friend/avatar/avatar-parts";

// 目パーツ。向かって左の目を原点中心に描く（外側の目じりが -x）。右目は描画側で左右反転する。
const LINE = "#2a2220";
const PUPIL = "#141010";

function Iris({ color, r, cy = 0.8 }: { color: string; r: number; cy?: number }) {
  return (
    <>
      <circle cy={cy} r={r} fill={color} />
      <circle cy={cy} r={r * 0.48} fill={PUPIL} />
      <circle cx={-r * 0.35} cy={cy - r * 0.38} r={r * 0.3} fill="white" />
    </>
  );
}

function RoundEye({ color }: { color: string }) {
  return (
    <>
      <ellipse rx={6.5} ry={7.5} fill="white" stroke={LINE} strokeWidth={1.6} />
      <Iris color={color} r={4.6} />
    </>
  );
}

function AlmondEye({ color }: { color: string }) {
  return (
    <>
      <path
        d="M-10 1 C-5 -6 6 -6 10 -1 C5 4 -5 5 -10 1 Z"
        fill="white"
        stroke={LINE}
        strokeWidth={1.2}
      />
      <Iris color={color} r={3.8} cy={-0.4} />
      <path
        d="M-10.5 1.5 C-5 -6 6 -6 10 -1"
        fill="none"
        stroke={LINE}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </>
  );
}

export const eyes: Record<EyeStyleId, (props: { color: string }) => React.ReactNode> = {
  round: RoundEye,
  dot: ({ color }) => (
    <>
      <ellipse rx={3.9} ry={4.6} fill={color} stroke={PUPIL} strokeWidth={1} />
      <circle cx={-1.2} cy={-1.6} r={1.3} fill="white" />
    </>
  ),
  big: ({ color }) => (
    <>
      <ellipse rx={8} ry={9.5} fill="white" stroke={LINE} strokeWidth={1.6} />
      <ellipse cy={1} rx={6} ry={7} fill={color} />
      <circle cy={1.5} r={3} fill={PUPIL} />
      <circle cx={-2.4} cy={-2.2} r={2} fill="white" />
      <circle cx={2.2} cy={3.2} r={1} fill="white" />
      <path
        d="M-8.6 -2 C-6 -11 6 -11 8.6 -2"
        fill="none"
        stroke={LINE}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </>
  ),
  almond: AlmondEye,
  upturned: ({ color }) => (
    <g transform="rotate(14)">
      <AlmondEye color={color} />
    </g>
  ),
  droopy: ({ color }) => (
    <g transform="rotate(-14)">
      <path
        d="M-9 2 C-6 -6 6 -7 9 -1 C6 5 -6 6 -9 2 Z"
        fill="white"
        stroke={LINE}
        strokeWidth={1.4}
      />
      <Iris color={color} r={4} cy={0} />
      <path
        d="M-9.5 2.5 C-6 -6 6 -7 9 -1"
        fill="none"
        stroke={LINE}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </g>
  ),
  sleepy: ({ color }) => (
    <>
      <path d="M-8 -1 C-8 6.5 8 6.5 8 -1 Z" fill="white" stroke={LINE} strokeWidth={1.2} />
      <path d="M-4.2 -1 C-4.2 5 4.2 5 4.2 -1 Z" fill={color} />
      <path d="M-2.1 -1 C-2.1 2 2.1 2 2.1 -1 Z" fill={PUPIL} />
      <path d="M-9 -1 L9 -1" stroke={LINE} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  double: ({ color }) => (
    <>
      <RoundEye color={color} />
      <path
        d="M-7 -10.5 C-3 -13.5 4 -13.5 8 -9.5"
        fill="none"
        stroke={LINE}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </>
  ),
  lashes: ({ color }) => (
    <>
      <RoundEye color={color} />
      <path
        d="M-6.5 -4.5 C-3 -9 4 -9 6.8 -3.5"
        fill="none"
        stroke={LINE}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path
        d="M-5.5 -5.5 L-9.5 -9 M-7 -2.8 L-11.5 -4.6 M-3 -7.3 L-5 -11"
        stroke={LINE}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </>
  ),
  narrow: ({ color }) => (
    <>
      <ellipse rx={8} ry={3.8} fill="white" stroke={LINE} strokeWidth={1.4} />
      <circle r={3.2} fill={color} />
      <circle r={1.5} fill={PUPIL} />
      <circle cx={-1.2} cy={-1.1} r={0.9} fill="white" />
    </>
  ),
  smile: () => (
    <path
      d="M-8 2 C-4 -5 4 -5 8 2"
      fill="none"
      stroke={LINE}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  ),
  line: () => (
    <path
      d="M-8 0 C-3 1.5 3 1.5 8 0"
      fill="none"
      stroke={LINE}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  ),
};
