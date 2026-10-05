import type { EyeStyleId } from "@auto-friend/avatar/avatar-parts";

// 目パーツ。向かって左の目を原点中心に描く（外側の目じりが -x）。右目は描画側で左右反転する。
// 白目（sclera）の形で黒目を切り抜き、上まぶたの線（lid）とまつげ（lashes）を重ねる。
// closed は閉じた目で、線だけを描く。
export type EyeShape = {
  sclera?: string;
  iris?: { cx: number; cy: number; rx: number; ry: number };
  lid?: { d: string; width: number };
  lashes?: string;
  crease?: string;
  lower?: string;
  rotate?: number;
  closed?: { d: string; width: number };
};

function ellipse(rx: number, ry: number) {
  return `M${-rx} 0 A${rx} ${ry} 0 1 0 ${rx} 0 A${rx} ${ry} 0 1 0 ${-rx} 0 Z`;
}

const ROUND: EyeShape = {
  sclera: ellipse(7.6, 9.6),
  iris: { cx: 0.6, cy: 1.4, rx: 6.4, ry: 8.2 },
  lid: { d: "M-8.8 -3.2 C-7.4 -10.8 6.2 -11.8 8.6 -4.6", width: 2.8 },
  lashes: "M-8.8 -3.2 L-11.4 -5.4",
};
const BIG: EyeShape = {
  sclera: ellipse(8.6, 11),
  iris: { cx: 0.6, cy: 1.8, rx: 7.3, ry: 9.6 },
  lid: { d: "M-10 -4 C-8.2 -12.6 7 -13.6 9.8 -5", width: 3.2 },
  lashes: "M-10 -4 L-13 -6.4 M-8.8 -7.8 L-11.6 -10.8",
};
const ALMOND: EyeShape = {
  sclera: "M-11 1 C-7 -7 6 -8 11 -2 C7 5 -6 6 -11 1 Z",
  iris: { cx: 0.6, cy: -0.2, rx: 5.8, ry: 6.2 },
  lid: { d: "M-11.6 1.6 C-7 -7.2 6 -8.2 11 -2", width: 2.8 },
  lashes: "M-11.6 1.6 L-13.8 0.2",
};

export const eyeShapes: Record<EyeStyleId, EyeShape> = {
  round: ROUND,
  dot: { iris: { cx: 0, cy: 0, rx: 4.8, ry: 6.2 } },
  big: BIG,
  almond: ALMOND,
  upturned: { ...ALMOND, rotate: 12 },
  droopy: {
    sclera: "M-10 3.5 C-8.4 -6.4 6 -8.6 10 -2 C8.6 6.4 -3.6 8.6 -10 3.5 Z",
    iris: { cx: 1, cy: 0.8, rx: 6.2, ry: 7.4 },
    lid: { d: "M-10.6 4.2 C-8.6 -6.8 6 -9 10 -2", width: 2.8 },
  },
  sleepy: {
    sclera: "M-8.6 -1 C-8.6 8.6 8.6 8.6 8.6 -1 Z",
    iris: { cx: 0.4, cy: 1.6, rx: 6, ry: 7.6 },
    lid: { d: "M-9.8 -0.6 C-4 -2.2 4 -2.2 9.8 -0.6", width: 2.8 },
  },
  double: { ...ROUND, crease: "M-7.4 -13.4 C-3.4 -15.8 4 -15.8 8 -12" },
  lashes: {
    ...BIG,
    lashes: "M-10 -4 L-13.4 -5.6 M-9.4 -6.8 L-12.6 -9.4 M-7.6 -9.4 L-9.8 -12.6",
    lower: "M-7 8.6 C-3 11 3 11 6.6 8.8",
  },
  narrow: {
    sclera: ellipse(9.4, 5.4),
    iris: { cx: 0.6, cy: 0.6, rx: 5.2, ry: 5.6 },
    lid: { d: "M-10 -0.6 C-6.4 -6.6 6.4 -6.6 10 -0.6", width: 2.6 },
  },
  smile: { closed: { d: "M-8.6 3 C-5 -5.4 5 -5.4 8.6 3", width: 2.8 } },
  line: { closed: { d: "M-8.6 0.6 C-4 2.8 4 2.8 8.6 0.6", width: 2.6 } },
};
