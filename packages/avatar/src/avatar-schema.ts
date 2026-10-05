import z from "zod";

import {
  adjustRanges,
  beardStyleIds,
  cheekIds,
  eyeColorIds,
  eyeStyleIds,
  eyebrowStyleIds,
  faceShapeIds,
  favoriteColorIds,
  glassesColorIds,
  glassesStyleIds,
  hairColorIds,
  hairStyleIds,
  lipColorIds,
  mouthStyleIds,
  mustacheStyleIds,
  noseStyleIds,
  skinColorIds,
} from "./avatar-parts";
import type { AdjustKey } from "./avatar-parts";

function adjust(key: AdjustKey) {
  return z.number().int().min(adjustRanges[key].min).max(adjustRanges[key].max);
}

// アバター1体ぶんの組み合わせ。エージェントの avatar 列に JSON で保存し、API でもそのまま受け渡す。
export const avatarSchema = z.object({
  face: z.object({
    shape: z.enum(faceShapeIds),
    skinColor: z.enum(skinColorIds),
    cheek: z.enum(cheekIds),
  }),
  hair: z.object({
    style: z.enum(hairStyleIds),
    color: z.enum(hairColorIds),
    // 分け目やポニーテールの向きを左右反転する
    flip: z.boolean(),
  }),
  eyebrow: z.object({
    style: z.enum(eyebrowStyleIds),
    color: z.enum(hairColorIds),
    y: adjust("y"),
    size: adjust("size"),
    rotation: adjust("rotation"),
    spacing: adjust("spacing"),
  }),
  eye: z.object({
    style: z.enum(eyeStyleIds),
    color: z.enum(eyeColorIds),
    y: adjust("y"),
    size: adjust("size"),
    rotation: adjust("rotation"),
    spacing: adjust("spacing"),
  }),
  nose: z.object({
    style: z.enum(noseStyleIds),
    y: adjust("y"),
    size: adjust("size"),
  }),
  mouth: z.object({
    style: z.enum(mouthStyleIds),
    color: z.enum(lipColorIds),
    y: adjust("y"),
    size: adjust("size"),
  }),
  facialHair: z.object({
    mustache: z.enum(mustacheStyleIds),
    beard: z.enum(beardStyleIds),
    color: z.enum(hairColorIds),
  }),
  glasses: z.object({
    style: z.enum(glassesStyleIds),
    color: z.enum(glassesColorIds),
    size: adjust("size"),
  }),
  mole: z.object({
    visible: z.boolean(),
    x: adjust("moleX"),
    y: adjust("moleY"),
  }),
  body: z.object({
    height: adjust("body"),
    build: adjust("body"),
  }),
  favoriteColor: z.enum(favoriteColorIds),
});

export type Avatar = z.infer<typeof avatarSchema>;
