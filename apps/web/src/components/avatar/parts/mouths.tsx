import type { MouthStyleId } from "@auto-friend/avatar/avatar-parts";

// 口パーツ。原点中心に小さめに描く。lip は唇の色、line は口の線の色。
type MouthProps = { lip: string; line: string };
const INSIDE = "#a8343c";
const TONGUE = "#f2868c";

function stroke(d: string, width = 2.2) {
  return ({ line }: MouthProps) => (
    <path d={d} fill="none" stroke={line} strokeWidth={width} strokeLinecap="round" />
  );
}

export const mouths: Record<MouthStyleId, (props: MouthProps) => React.ReactNode> = {
  smile: stroke("M-6.4 -1 C-3.4 3.8 3.4 3.8 6.4 -1"),
  happy: ({ line }) => (
    <>
      <path
        d="M-7 -2 C-5 7.6 5 7.6 7 -2 Z"
        fill={INSIDE}
        stroke={line}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M-4 4.2 C-2 2.4 2 2.4 4 4.2 C2.4 5.6 -2.4 5.6 -4 4.2 Z" fill={TONGUE} />
    </>
  ),
  grin: ({ line }) => (
    <>
      <path
        d="M-8.4 -2.6 C-5.6 8 5.6 8 8.4 -2.6 Z"
        fill={INSIDE}
        stroke={line}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M-7.6 -2.2 C-3 -1.2 3 -1.2 7.6 -2.2 L6.8 0.6 C2.4 1.4 -2.4 1.4 -6.8 0.6 Z"
        fill="white"
      />
      <path d="M-4 4.6 C-2 2.8 2 2.8 4 4.6 C2.4 6 -2.4 6 -4 4.6 Z" fill={TONGUE} />
    </>
  ),
  neutral: stroke("M-5 0.4 L5 0.4", 2),
  small: ({ lip, line }) => <ellipse rx={2.8} ry={2} fill={lip} stroke={line} strokeWidth={0.9} />,
  open: ({ line }) => (
    <>
      <ellipse rx={3.6} ry={4.4} fill={INSIDE} stroke={line} strokeWidth={1.2} />
      <ellipse cy={2.4} rx={2.4} ry={1.6} fill={TONGUE} />
    </>
  ),
  cat: stroke("M-7 -1.6 C-5.4 2.6 -1.6 2.6 0 -0.6 C1.6 2.6 5.4 2.6 7 -1.6", 2),
  frown: stroke("M-5.6 2 C-2.8 -1.8 2.8 -1.8 5.6 2"),
  lips: ({ lip, line }) => (
    <>
      <path
        d="M-6.4 0 C-4 -3 -1.4 -3 0 -1.4 C1.4 -3 4 -3 6.4 0 C3.2 0.8 -3.2 0.8 -6.4 0 Z"
        fill={lip}
      />
      <path d="M-6.4 0 C-4 4.4 4 4.4 6.4 0 C3.2 0.8 -3.2 0.8 -6.4 0 Z" fill={lip} />
      <path d="M-6.4 0 C-3.2 0.8 3.2 0.8 6.4 0" fill="none" stroke={line} strokeWidth={0.9} />
      <ellipse cx={-2} cy={1.8} rx={1.4} ry={0.7} fill="white" fillOpacity={0.5} />
    </>
  ),
  smirk: stroke("M-6 1 C-2 2.6 2.6 2 6.6 -2.4"),
  tongue: ({ line }) => (
    <>
      <path d="M1 1.6 C1 6.4 6 6.4 6 1" fill={TONGUE} stroke={line} strokeWidth={1} />
      <path
        d="M-6.4 -1 C-3.4 3.8 3.4 3.8 6.4 -1"
        fill="none"
        stroke={line}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </>
  ),
  wavy: stroke("M-7 0 Q-5.25 -2.2 -3.5 0 T0 0 T3.5 0 T7 0", 1.8),
};
