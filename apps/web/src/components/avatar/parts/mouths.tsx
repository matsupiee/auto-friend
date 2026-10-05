import type { MouthStyleId } from "@auto-friend/avatar/avatar-parts";

// 口パーツ。原点中心に描く。lip は唇・舌の色、line は口の線の色。
type MouthProps = { lip: string; line: string };
const INSIDE = "#7a2421";

function stroke(d: string, width = 2.4) {
  return ({ line }: MouthProps) => (
    <path d={d} fill="none" stroke={line} strokeWidth={width} strokeLinecap="round" />
  );
}

export const mouths: Record<MouthStyleId, (props: MouthProps) => React.ReactNode> = {
  smile: stroke("M-10 -2 C-5 5 5 5 10 -2"),
  grin: ({ lip }) => (
    <>
      <path d="M-11 -3 C-6 10 6 10 11 -3 Z" fill={INSIDE} />
      <path d="M-10.2 -2.6 C-4 -1 4 -1 10.2 -2.6 L9 0.5 C3 1.5 -3 1.5 -9 0.5 Z" fill="white" />
      <path d="M-5 5.2 C-2 2.4 2 2.4 5 5.2 C2 7 -2 7 -5 5.2 Z" fill={lip} />
    </>
  ),
  neutral: stroke("M-8 0 L8 0", 2.2),
  small: ({ lip, line }) => (
    <ellipse rx={3.4} ry={2.4} fill={lip} stroke={line} strokeWidth={0.8} />
  ),
  open: ({ lip }) => (
    <>
      <ellipse rx={4.6} ry={5.6} fill={INSIDE} />
      <ellipse cy={3} rx={3} ry={2} fill={lip} />
    </>
  ),
  cat: stroke("M-9 -1.5 C-7 3 -2 3 0 -1 C2 3 7 3 9 -1.5", 2.2),
  frown: stroke("M-9 3 C-4 -3 4 -3 9 3"),
  lips: ({ lip, line }) => (
    <>
      <path d="M-10 0 C-6 -4 -2 -4 0 -2 C2 -4 6 -4 10 0 C5 1 -5 1 -10 0 Z" fill={lip} />
      <path d="M-10 0 C-6 6 6 6 10 0 C5 1 -5 1 -10 0 Z" fill={lip} />
      <path d="M-10 0 C-5 1 5 1 10 0" fill="none" stroke={line} strokeWidth={1} />
    </>
  ),
  smirk: stroke("M-9 1 C-3 3 4 2 10 -4"),
  tongue: ({ lip, line }) => (
    <>
      <path d="M1.5 1.8 C1.5 8 8 8 8 0.5 Z" fill={lip} stroke={line} strokeWidth={0.8} />
      <path
        d="M-10 -2 C-5 5 5 5 10 -2"
        fill="none"
        stroke={line}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </>
  ),
  wavy: stroke("M-10 0 Q-7.5 -3 -5 0 T0 0 T5 0 T10 0", 2),
};
