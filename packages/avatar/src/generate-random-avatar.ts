import {
  beardStyleIds,
  cheekIds,
  eyeColorIds,
  eyeStyleIds,
  eyebrowStyleIds,
  faceShapeIds,
  favoriteColorIds,
  glassesColorIds,
  glassesStyleIds,
  lipColorIds,
  mouthStyleIds,
  mustacheStyleIds,
  noseStyleIds,
} from "./avatar-parts";
import type { HairColorId, HairStyleId, SkinColorId } from "./avatar-parts";
import type { Avatar } from "./avatar-schema";

type Gender = "male" | "female" | "other";

const maleHair: HairStyleId[] = [
  "short",
  "short",
  "sidePart",
  "spiky",
  "mash",
  "mash",
  "centerPart",
  "centerPart",
  "pompadour",
  "curly",
  "buzz",
  "bald",
];
const femaleHair: HairStyleId[] = [
  "bob",
  "bob",
  "long",
  "long",
  "hime",
  "wavy",
  "wavy",
  "ponytail",
  "twinTails",
  "bun",
  "short",
  "centerPart",
];
// 実在しそうな見た目に寄せるため、暗い色ほど出やすくする
const naturalHairColors: HairColorId[] = [
  "black",
  "black",
  "black",
  "darkBrown",
  "darkBrown",
  "darkBrown",
  "brown",
  "brown",
  "chestnut",
  "blonde",
  "gray",
  "silver",
  "red",
  "pink",
  "blue",
];
const commonSkinColors: SkinColorId[] = [
  "porcelain",
  "light",
  "light",
  "natural",
  "natural",
  "natural",
  "warm",
  "warm",
  "tan",
  "bronze",
  "brown",
  "deep",
];

// random は 0 以上 1 未満を返す関数。seed 付きの乱数を渡せば、同じ見た目を何度でも作れる。
export function generateRandomAvatar(random: () => number, gender: Gender = "other"): Avatar {
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T;
  const chance = (p: number) => random() < p;
  const around = (spread: number) => Math.round((random() + random() - 1) * spread);

  const hairPool =
    gender === "male" ? maleHair : gender === "female" ? femaleHair : [...maleHair, ...femaleHair];
  const hairColor = pick(naturalHairColors);
  const masculine = gender === "male";
  const feminine = gender === "female";

  return {
    face: {
      shape: pick(faceShapeIds),
      skinColor: pick(commonSkinColors),
      cheek: chance(feminine ? 0.45 : 0.2) ? pick(cheekIds.filter((c) => c !== "none")) : "none",
    },
    hair: { style: pick(hairPool), color: hairColor, flip: chance(0.5) },
    eyebrow: {
      style: pick(eyebrowStyleIds),
      // 眉は髪よりも少し暗めに見えることが多いので、明るい髪でも黒・こげ茶に寄せる
      color: chance(0.6) ? hairColor : pick(["black", "darkBrown"] as const),
      y: around(2),
      size: around(1),
      rotation: around(1),
      spacing: around(1),
    },
    eye: {
      style: pick(eyeStyleIds),
      color: chance(0.8) ? pick(["black", "brown"] as const) : pick(eyeColorIds),
      y: around(1),
      size: around(1),
      rotation: 0,
      spacing: around(1),
    },
    nose: { style: pick(noseStyleIds), y: around(1), size: around(1) },
    mouth: {
      style: pick(mouthStyleIds),
      color: feminine && chance(0.5) ? pick(lipColorIds) : "natural",
      y: around(1),
      size: around(1),
    },
    facialHair: {
      mustache:
        masculine && chance(0.18) ? pick(mustacheStyleIds.filter((m) => m !== "none")) : "none",
      beard: masculine && chance(0.18) ? pick(beardStyleIds.filter((b) => b !== "none")) : "none",
      color: hairColor,
    },
    glasses: {
      style: chance(0.22) ? pick(glassesStyleIds.filter((g) => g !== "none")) : "none",
      color: pick(glassesColorIds),
      size: 0,
    },
    mole: { visible: chance(0.15), x: around(10), y: around(10) },
    body: {
      height: Math.max(0, Math.min(100, 50 + around(30) + (masculine ? 8 : feminine ? -8 : 0))),
      build: Math.max(0, Math.min(100, 50 + around(28))),
    },
    favoriteColor: pick(favoriteColorIds),
  };
}
