import type { BeardStyleId, MustacheStyleId } from "@auto-friend/avatar/avatar-parts";

// 口ひげ。鼻と口のあいだを原点に描く。
export const mustaches: Record<MustacheStyleId, string | null> = {
  none: null,
  thin: "M-12 1 C-7 -3 -2 -3 0 -1 C2 -3 7 -3 12 1 C7 0 2 0 0 0.5 C-2 0 -7 0 -12 1 Z",
  thick: "M-15 3 C-10 -5 -3 -5 0 -2 C3 -5 10 -5 15 3 C10 2 4 1 0 2 C-4 1 -10 2 -15 3 Z",
  handlebar:
    "M-4 -2 C-9 -4 -14 -1 -16 -5 C-18 -1 -14 3 -8 2 C-5 1.5 -2 1 0 0 C2 1 5 1.5 8 2 C14 3 18 -1 16 -5 C14 -1 9 -4 4 -2 C2 -2.5 -2 -2.5 -4 -2 Z",
  split: "M-4.5 -3 L4.5 -3 L4.5 1.5 L-4.5 1.5 Z",
};

// あごひげ。標準の輪郭（半幅 56・あご先 166）に合わせた座標で、描画時に輪郭へ合わせて伸縮する。
// opacity が 1 未満のものは、肌が透けて見える薄いひげ。
export const beards: Record<BeardStyleId, { d: string; opacity: number; stroke?: number } | null> =
  {
    none: null,
    stubble: {
      d: "M46 118 C48 150 70 166 100 166 C130 166 152 150 154 118 C146 132 128 140 116 136 C108 132 92 132 84 136 C72 140 54 132 46 118 Z",
      opacity: 0.3,
    },
    goatee: {
      d: "M88 151 C90 160 94 165 100 165 C106 165 110 160 112 151 C106 154 94 154 88 151 Z",
      opacity: 1,
    },
    chinstrap: {
      d: "M45 98 C45 140 70 166 100 166 C130 166 155 140 155 98",
      opacity: 1,
      stroke: 5,
    },
    full: {
      d: "M45 108 C44 152 70 172 100 172 C130 172 156 152 155 108 C150 128 134 138 120 134 C112 130 88 130 80 134 C66 138 50 128 45 108 Z",
      opacity: 1,
    },
  };
