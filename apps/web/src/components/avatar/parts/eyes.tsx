import type { EyeStyleId } from "@auto-friend/avatar/avatar-parts";

// 目パーツ。向かって左の目を原点中心に描く（外側の目じりが -x）。右目は描画側で左右反転する。
// LINE のアバターのように、縦長の濃い楕円（ball）に白いツヤを1つ入れ、
// 目より外側まで伸びる太めの上まぶたの線（lid）で表情を決める。目じりは少し上げる。
// lashes はまつげ（1〜2本まで）、cover は上半分を肌色で隠す半目、closed は閉じた目の線。
export type EyeShape = {
  ball?: { rx: number; ry: number };
  lid?: { d: string; width: number };
  lashes?: string;
  crease?: string;
  cover?: string;
  rotate?: number;
  closed?: { d: string; width: number };
};

const ROUND: EyeShape = {
  ball: { rx: 5.4, ry: 6.8 },
  lid: { d: "M-8.6 -3.6 C-5.4 -9 4.4 -9.4 7.8 -5.2", width: 2.6 },
};
const BIG: EyeShape = {
  ball: { rx: 6.4, ry: 8 },
  lid: { d: "M-9.6 -4.4 C-5.8 -10.8 5 -11.2 8.8 -6", width: 2.8 },
};
const ALMOND: EyeShape = {
  ball: { rx: 5.6, ry: 5.2 },
  lid: { d: "M-8.8 -1 C-5.2 -7.6 4.6 -7.8 8.4 -3", width: 2.6 },
};

export const eyeShapes: Record<EyeStyleId, EyeShape> = {
  round: ROUND,
  dot: {
    ball: { rx: 4.5, ry: 5.5 },
    lid: { d: "M-7 -2.8 C-4.4 -7.4 3.6 -7.6 6.4 -4.2", width: 2.2 },
  },
  big: BIG,
  almond: ALMOND,
  upturned: { ...ALMOND, rotate: 12 },
  droopy: { ...ROUND, rotate: -12 },
  sleepy: {
    ball: { rx: 5.4, ry: 6.8 },
    cover: "M-9 -8.5 L9 -8.5 L9 -0.8 C4 -2 -4 -2 -9 -0.8 Z",
    lid: { d: "M-8.6 -0.8 C-4 -2.2 4 -2.2 8.6 -0.8", width: 2.6 },
  },
  double: { ...ROUND, crease: "M-6.4 -11.6 C-3 -13.8 3.4 -13.8 6.6 -11" },
  lashes: { ...BIG, lashes: "M-9.6 -4.4 L-12 -6.8 M-8.2 -7.8 L-10 -10.4" },
  narrow: {
    ball: { rx: 5.6, ry: 3.8 },
    lid: { d: "M-8.4 -1.4 C-4.6 -5.6 4.6 -5.6 8.2 -2.4", width: 2.4 },
  },
  smile: { closed: { d: "M-6.8 2.2 C-3.4 -4.2 3.4 -4.2 6.8 2.2", width: 2.4 } },
  line: { closed: { d: "M-6.8 0.4 C-3.4 2.2 3.4 2.2 6.8 0.4", width: 2.2 } },
};
