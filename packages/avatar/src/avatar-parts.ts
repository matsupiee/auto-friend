// アバター（似顔絵）を組み立てるパーツの一覧。
// DB にはここの id がそのまま保存されるので、id の変更や削除はデータ移行を伴う。追加は自由にできる。
// 見た目（SVG）は apps/web/src/components/avatar/parts に、同じ id で1つずつ用意する。

type Option<T extends string> = { readonly id: T; readonly label: string };
type ColorOption<T extends string> = Option<T> & { readonly hex: string };

function ids<const T extends readonly { id: string }[]>(options: T) {
  return options.map((o) => o.id) as unknown as readonly [T[number]["id"], ...T[number]["id"][]];
}

// ---- 輪郭・肌 ----

export const faceShapeOptions = [
  { id: "round", label: "まる" },
  { id: "oval", label: "たまご" },
  { id: "long", label: "面長" },
  { id: "square", label: "四角" },
  { id: "sharp", label: "シャープ" },
  { id: "jaw", label: "えら" },
  { id: "wide", label: "横長" },
  { id: "chubby", label: "ぽっちゃり" },
] as const satisfies readonly Option<string>[];
export const faceShapeIds = ids(faceShapeOptions);
export type FaceShapeId = (typeof faceShapeIds)[number];

export const skinColorOptions = [
  { id: "porcelain", label: "色白", hex: "#fde7d6" },
  { id: "light", label: "明るめ", hex: "#f9d7bd" },
  { id: "natural", label: "ふつう", hex: "#f2c6a0" },
  { id: "warm", label: "あたたかめ", hex: "#e6b088" },
  { id: "tan", label: "小麦色", hex: "#d29a6c" },
  { id: "bronze", label: "日焼け", hex: "#b77d53" },
  { id: "brown", label: "褐色", hex: "#8f5d3b" },
  { id: "deep", label: "濃い褐色", hex: "#674129" },
] as const satisfies readonly ColorOption<string>[];
export const skinColorIds = ids(skinColorOptions);
export type SkinColorId = (typeof skinColorIds)[number];

export const cheekOptions = [
  { id: "none", label: "なし" },
  { id: "blush", label: "チーク" },
  { id: "freckles", label: "そばかす" },
  { id: "shy", label: "照れ" },
  { id: "tired", label: "くま" },
] as const satisfies readonly Option<string>[];
export const cheekIds = ids(cheekOptions);
export type CheekId = (typeof cheekIds)[number];

// ---- 髪 ----

export const hairStyleOptions = [
  { id: "bald", label: "スキンヘッド" },
  { id: "buzz", label: "坊主" },
  { id: "short", label: "ショート" },
  { id: "sidePart", label: "七三" },
  { id: "spiky", label: "ツンツン" },
  { id: "mash", label: "マッシュ" },
  { id: "centerPart", label: "センター分け" },
  { id: "pompadour", label: "リーゼント" },
  { id: "curly", label: "パーマ" },
  { id: "bob", label: "ボブ" },
  { id: "long", label: "ロング" },
  { id: "hime", label: "ぱっつん" },
  { id: "wavy", label: "ウェーブ" },
  { id: "ponytail", label: "ポニーテール" },
  { id: "twinTails", label: "ツインテール" },
  { id: "bun", label: "おだんご" },
] as const satisfies readonly Option<string>[];
export const hairStyleIds = ids(hairStyleOptions);
export type HairStyleId = (typeof hairStyleIds)[number];

export const hairColorOptions = [
  { id: "black", label: "黒", hex: "#2b2422" },
  { id: "darkBrown", label: "こげ茶", hex: "#4a3226" },
  { id: "brown", label: "茶", hex: "#714a30" },
  { id: "chestnut", label: "明るい茶", hex: "#a26d42" },
  { id: "blonde", label: "金", hex: "#e2bf72" },
  { id: "gray", label: "グレー", hex: "#7f7d7b" },
  { id: "silver", label: "白", hex: "#e4e2df" },
  { id: "red", label: "赤", hex: "#a63c2c" },
  { id: "pink", label: "ピンク", hex: "#e58bab" },
  { id: "blue", label: "青", hex: "#3d5ea6" },
] as const satisfies readonly ColorOption<string>[];
export const hairColorIds = ids(hairColorOptions);
export type HairColorId = (typeof hairColorIds)[number];

// ---- 眉・目・鼻・口 ----

export const eyebrowStyleOptions = [
  { id: "natural", label: "ふつう" },
  { id: "thin", label: "細い" },
  { id: "thick", label: "太い" },
  { id: "straight", label: "まっすぐ" },
  { id: "arched", label: "アーチ" },
  { id: "angry", label: "つり眉" },
  { id: "worried", label: "困り眉" },
  { id: "short", label: "まろ" },
  { id: "bushy", label: "ふさふさ" },
] as const satisfies readonly Option<string>[];
export const eyebrowStyleIds = ids(eyebrowStyleOptions);
export type EyebrowStyleId = (typeof eyebrowStyleIds)[number];

export const eyeStyleOptions = [
  { id: "round", label: "まる" },
  { id: "dot", label: "つぶら" },
  { id: "big", label: "ぱっちり" },
  { id: "almond", label: "切れ長" },
  { id: "upturned", label: "つり目" },
  { id: "droopy", label: "たれ目" },
  { id: "sleepy", label: "ねむそう" },
  { id: "double", label: "二重" },
  { id: "lashes", label: "まつげ" },
  { id: "narrow", label: "細め" },
  { id: "smile", label: "にっこり" },
  { id: "line", label: "糸目" },
] as const satisfies readonly Option<string>[];
export const eyeStyleIds = ids(eyeStyleOptions);
export type EyeStyleId = (typeof eyeStyleIds)[number];

export const eyeColorOptions = [
  { id: "black", label: "黒", hex: "#2a2524" },
  { id: "brown", label: "茶", hex: "#6b4426" },
  { id: "hazel", label: "ヘーゼル", hex: "#93732f" },
  { id: "blue", label: "青", hex: "#3a6fb8" },
  { id: "green", label: "緑", hex: "#3f8f5a" },
  { id: "gray", label: "グレー", hex: "#7a8590" },
] as const satisfies readonly ColorOption<string>[];
export const eyeColorIds = ids(eyeColorOptions);
export type EyeColorId = (typeof eyeColorIds)[number];

export const noseStyleOptions = [
  { id: "dot", label: "ちょこん" },
  { id: "curve", label: "カーブ" },
  { id: "hook", label: "かぎ" },
  { id: "button", label: "だんご" },
  { id: "triangle", label: "三角" },
  { id: "tall", label: "高い" },
] as const satisfies readonly Option<string>[];
export const noseStyleIds = ids(noseStyleOptions);
export type NoseStyleId = (typeof noseStyleIds)[number];

export const mouthStyleOptions = [
  { id: "smile", label: "にこっ" },
  { id: "grin", label: "にかっ" },
  { id: "neutral", label: "まっすぐ" },
  { id: "small", label: "おちょぼ" },
  { id: "open", label: "ぽかん" },
  { id: "cat", label: "ねこ口" },
  { id: "frown", label: "への字" },
  { id: "lips", label: "ぷっくり" },
  { id: "smirk", label: "にやり" },
  { id: "tongue", label: "てへ" },
  { id: "wavy", label: "もにょ" },
] as const satisfies readonly Option<string>[];
export const mouthStyleIds = ids(mouthStyleOptions);
export type MouthStyleId = (typeof mouthStyleIds)[number];

export const lipColorOptions = [
  { id: "natural", label: "ナチュラル", hex: "#d77a6c" },
  { id: "pink", label: "ピンク", hex: "#ea6f98" },
  { id: "red", label: "赤", hex: "#cf3a3d" },
  { id: "coral", label: "コーラル", hex: "#ee8a5e" },
  { id: "berry", label: "ベリー", hex: "#9c3557" },
] as const satisfies readonly ColorOption<string>[];
export const lipColorIds = ids(lipColorOptions);
export type LipColorId = (typeof lipColorIds)[number];

// ---- ヒゲ・メガネ ----

export const mustacheStyleOptions = [
  { id: "none", label: "なし" },
  { id: "thin", label: "うすい" },
  { id: "thick", label: "こい" },
  { id: "handlebar", label: "カイゼル" },
  { id: "split", label: "ちょび" },
] as const satisfies readonly Option<string>[];
export const mustacheStyleIds = ids(mustacheStyleOptions);
export type MustacheStyleId = (typeof mustacheStyleIds)[number];

export const beardStyleOptions = [
  { id: "none", label: "なし" },
  { id: "stubble", label: "ぶしょう" },
  { id: "goatee", label: "あご" },
  { id: "chinstrap", label: "もみあげ" },
  { id: "full", label: "フル" },
] as const satisfies readonly Option<string>[];
export const beardStyleIds = ids(beardStyleOptions);
export type BeardStyleId = (typeof beardStyleIds)[number];

export const glassesStyleOptions = [
  { id: "none", label: "なし" },
  { id: "round", label: "まる" },
  { id: "square", label: "スクエア" },
  { id: "oval", label: "オーバル" },
  { id: "halfRim", label: "ハーフリム" },
  { id: "big", label: "大きめ" },
  { id: "sunglasses", label: "サングラス" },
] as const satisfies readonly Option<string>[];
export const glassesStyleIds = ids(glassesStyleOptions);
export type GlassesStyleId = (typeof glassesStyleIds)[number];

export const glassesColorOptions = [
  { id: "black", label: "黒", hex: "#2c2c2e" },
  { id: "brown", label: "べっこう", hex: "#7a4a2a" },
  { id: "red", label: "赤", hex: "#c23a3a" },
  { id: "blue", label: "青", hex: "#2f5fb3" },
  { id: "gold", label: "ゴールド", hex: "#c9a548" },
  { id: "silver", label: "シルバー", hex: "#9aa0a6" },
] as const satisfies readonly ColorOption<string>[];
export const glassesColorIds = ids(glassesColorOptions);
export type GlassesColorId = (typeof glassesColorIds)[number];

// ---- 好きな色（服の色） ----

export const favoriteColorOptions = [
  { id: "red", label: "赤", hex: "#e2463f" },
  { id: "orange", label: "オレンジ", hex: "#f08a2c" },
  { id: "yellow", label: "黄", hex: "#f2c73a" },
  { id: "lime", label: "黄緑", hex: "#8cc63f" },
  { id: "green", label: "緑", hex: "#2f9a52" },
  { id: "blue", label: "青", hex: "#2f6fd0" },
  { id: "sky", label: "水色", hex: "#4fb8e6" },
  { id: "pink", label: "ピンク", hex: "#f07aa8" },
  { id: "purple", label: "紫", hex: "#8b5bc8" },
  { id: "brown", label: "茶", hex: "#8a5a35" },
  { id: "white", label: "白", hex: "#f4f4f2" },
  { id: "black", label: "黒", hex: "#33343a" },
] as const satisfies readonly ColorOption<string>[];
export const favoriteColorIds = ids(favoriteColorOptions);
export type FavoriteColorId = (typeof favoriteColorIds)[number];

// ---- 位置・大きさの調整幅 ----
// 調整値は 0 が標準の整数。1目盛りでどれだけ動くかは描画側（apps/web）が決める。

export const adjustRanges = {
  y: { min: -6, max: 6 },
  size: { min: -4, max: 4 },
  rotation: { min: -4, max: 4 },
  spacing: { min: -5, max: 5 },
  moleX: { min: -12, max: 12 },
  moleY: { min: -12, max: 12 },
  // 体格は 0〜100。50 が標準。
  body: { min: 0, max: 100 },
} as const;
export type AdjustKey = keyof typeof adjustRanges;

// id から表示用の色を引く。未知の id は先頭の色にする。
export function colorHex<T extends string>(options: readonly ColorOption<T>[], id: string): string {
  return (options.find((o) => o.id === id) ?? options[0])?.hex ?? "#000000";
}
