import type { BeardStyleId, MustacheStyleId } from "@auto-friend/avatar/avatar-parts";

// 口ひげ。鼻と口のあいだを原点に描く。
export const mustaches: Record<MustacheStyleId, string | null> = {
  none: null,
  thin: "M-10 1 C-6 -2.6 -1.6 -2.6 0 -0.8 C1.6 -2.6 6 -2.6 10 1 C6 0 1.6 0 0 0.4 C-1.6 0 -6 0 -10 1 Z",
  thick:
    "M-12.6 2.6 C-8.4 -4.2 -2.6 -4.2 0 -1.6 C2.6 -4.2 8.4 -4.2 12.6 2.6 C8.4 1.6 3.4 0.8 0 1.6 C-3.4 0.8 -8.4 1.6 -12.6 2.6 Z",
  handlebar:
    "M-3.4 -1.6 C-7.6 -3.4 -11.8 -0.8 -13.4 -4.2 C-15 -0.8 -11.8 2.6 -6.8 1.6 C-4.2 1.2 -1.6 0.8 0 0 C1.6 0.8 4.2 1.2 6.8 1.6 C11.8 2.6 15 -0.8 13.4 -4.2 C11.8 -0.8 7.6 -3.4 3.4 -1.6 C1.6 -2 -1.6 -2 -3.4 -1.6 Z",
  split: "M-3.8 -2.6 L3.8 -2.6 L3.8 1.2 L-3.8 1.2 Z",
};

// あごひげ。標準の輪郭（半幅 60・あご先 178）に合わせた座標で、描画時に輪郭へ合わせて伸縮する。
// opacity が 1 未満のものは、肌が透けて見える薄いひげ。
export const beards: Record<BeardStyleId, { d: string; opacity: number; stroke?: number } | null> =
  {
    none: null,
    stubble: {
      d: "M44 128 C48 160 74 177 100 177 C126 177 152 160 156 128 C148 144 130 150 118 146 C110 142 90 142 82 146 C70 150 52 144 44 128 Z",
      opacity: 0.28,
    },
    goatee: {
      d: "M92 164 C93 172 96 176 100 176 C104 176 107 172 108 164 C104 166 96 166 92 164 Z",
      opacity: 1,
    },
    chinstrap: {
      d: "M42 112 C44 152 70 177 100 177 C130 177 156 152 158 112",
      opacity: 1,
      stroke: 3,
    },
    full: {
      d: "M42 120 C42 164 70 184 100 184 C130 184 158 164 158 120 C152 140 136 150 122 146 C112 142 88 142 78 146 C64 150 48 140 42 120 Z",
      opacity: 1,
    },
  };
