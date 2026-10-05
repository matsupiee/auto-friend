import type { FaceShapeId } from "@auto-friend/avatar/avatar-parts";

// 輪郭パーツ。座標は 200×200 の顔キャンバス（中心 x=100）。
// halfWidth は耳の高さでの顔の半幅、top は頭頂、chin はあご先。髪やヒゲはこの値に合わせて伸縮する。
export type FaceShape = { d: string; halfWidth: number; top: number; chin: number };

export const faceShapes: Record<FaceShapeId, FaceShape> = {
  round: {
    d: "M100 46 C136 46 158 72 158 106 C158 142 134 166 100 166 C66 166 42 142 42 106 C42 72 64 46 100 46 Z",
    halfWidth: 58,
    top: 46,
    chin: 166,
  },
  oval: {
    d: "M100 44 C134 44 155 70 155 104 C155 144 130 170 100 170 C70 170 45 144 45 104 C45 70 66 44 100 44 Z",
    halfWidth: 55,
    top: 44,
    chin: 170,
  },
  long: {
    d: "M100 40 C132 40 152 64 152 100 C152 148 128 175 100 175 C72 175 48 148 48 100 C48 64 68 40 100 40 Z",
    halfWidth: 52,
    top: 40,
    chin: 175,
  },
  square: {
    d: "M100 46 C140 46 156 66 156 100 L155 138 C154 158 132 166 100 166 C68 166 46 158 45 138 L44 100 C44 66 60 46 100 46 Z",
    halfWidth: 56,
    top: 46,
    chin: 166,
  },
  sharp: {
    d: "M100 46 C140 46 158 70 156 104 C154 132 124 168 100 171 C76 168 46 132 44 104 C42 70 60 46 100 46 Z",
    halfWidth: 57,
    top: 46,
    chin: 171,
  },
  jaw: {
    d: "M100 46 C138 46 156 68 156 100 C156 128 152 148 134 159 C121 166 110 167 100 167 C90 167 79 166 66 159 C48 148 44 128 44 100 C44 68 62 46 100 46 Z",
    halfWidth: 56,
    top: 46,
    chin: 167,
  },
  wide: {
    d: "M100 50 C144 50 162 76 162 108 C162 144 136 164 100 164 C64 164 38 144 38 108 C38 76 56 50 100 50 Z",
    halfWidth: 62,
    top: 50,
    chin: 164,
  },
  chubby: {
    d: "M100 48 C140 48 160 72 160 104 C160 124 165 140 153 154 C141 166 121 169 100 169 C79 169 59 166 47 154 C35 140 40 124 40 104 C40 72 60 48 100 48 Z",
    halfWidth: 60,
    top: 48,
    chin: 169,
  },
};
