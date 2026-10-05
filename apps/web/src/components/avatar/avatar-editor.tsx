import {
  adjustRanges,
  colorHex,
  beardStyleOptions,
  cheekOptions,
  eyeColorOptions,
  eyeStyleOptions,
  eyebrowStyleOptions,
  faceShapeOptions,
  favoriteColorOptions,
  glassesColorOptions,
  glassesStyleOptions,
  hairColorOptions,
  hairStyleOptions,
  lipColorOptions,
  mouthStyleOptions,
  mustacheStyleOptions,
  noseStyleOptions,
  skinColorOptions,
} from "@auto-friend/avatar/avatar-parts";
import type { AdjustKey } from "@auto-friend/avatar/avatar-parts";
import type { Avatar } from "@auto-friend/avatar/avatar-schema";
import { generateRandomAvatar } from "@auto-friend/avatar/generate-random-avatar";
import { Button } from "@auto-friend/ui/components/button";
import { cn } from "@auto-friend/ui/lib/utils";
import { Check, Dices, FlipHorizontal2 } from "lucide-react";
import { useState } from "react";

import { AvatarFigure } from "./avatar-figure";

type Gender = "male" | "female" | "other";

// サムネイルで拡大して見せる範囲（200×220 のキャンバス上）
const ZOOM = {
  head: "6 10 188 188",
  brow: "52 84 96 48",
  eye: "48 100 104 52",
  nose: "74 122 52 36",
  mouth: "70 136 60 40",
  beard: "30 112 140 86",
  glasses: "30 96 140 60",
} as const;

const CATEGORIES = [
  { key: "face", label: "輪郭" },
  { key: "hair", label: "髪型" },
  { key: "eyebrow", label: "眉" },
  { key: "eye", label: "目" },
  { key: "nose", label: "鼻" },
  { key: "mouth", label: "口" },
  { key: "facialHair", label: "ヒゲ" },
  { key: "glasses", label: "メガネ" },
  { key: "mole", label: "ほくろ" },
  { key: "body", label: "体格" },
  { key: "favoriteColor", label: "好きな色" },
] as const;
type CategoryKey = (typeof CATEGORIES)[number]["key"];

type Option = { readonly id: string; readonly label: string };
type ColorOption = Option & { readonly hex: string };

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[13px] font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

// パーツの一覧。いまの顔にそのパーツを当てはめたサムネイルを並べる
function PartGrid<T extends Option>({
  name,
  options,
  selected,
  preview,
  zoom,
  onSelect,
}: {
  name: string;
  options: readonly T[];
  selected: string;
  preview: (id: T["id"]) => Avatar;
  zoom: string;
  onSelect: (id: T["id"]) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <button
            key={option.id}
            type="button"
            aria-label={`${name}: ${option.label}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(option.id)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl border bg-muted/40 p-1.5 transition-colors",
              isSelected
                ? "border-foreground bg-background ring-1 ring-foreground"
                : "hover:bg-muted",
            )}
          >
            <AvatarFigure
              avatar={preview(option.id)}
              viewBox={zoom}
              className="aspect-square w-full"
            />
            <span className="w-full truncate text-center text-[11px] leading-tight">
              {option.label}
            </span>
            {isSelected && (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Swatches({
  name,
  options,
  selected,
  onSelect,
}: {
  name: string;
  options: readonly ColorOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <button
            key={option.id}
            type="button"
            title={option.label}
            aria-label={`${name}: ${option.label}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border border-black/10 transition-transform",
              isSelected
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "hover:scale-110",
            )}
            style={{ backgroundColor: option.hex }}
          >
            {isSelected && (
              <Check className="size-4 text-white mix-blend-difference" strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// 位置・大きさなどの調整。0 が標準で、左右の端に何が起きるかを書いておく
function Slider({
  label,
  range,
  value,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string;
  range: AdjustKey;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  const { min, max } = adjustRanges[range];
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
      <span className="flex justify-between text-[11px] text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </span>
    </label>
  );
}

type Adjustable = "eyebrow" | "eye";
function FeatureSliders({
  part,
  label,
  avatar,
  onChange,
}: {
  part: Adjustable;
  label: string;
  avatar: Avatar;
  onChange: (avatar: Avatar) => void;
}) {
  const set = (key: "y" | "size" | "rotation" | "spacing", value: number) =>
    onChange({ ...avatar, [part]: { ...avatar[part], [key]: value } });
  const v = avatar[part];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Slider
        label={`${label}の上下`}
        range="y"
        value={v.y}
        minLabel="上"
        maxLabel="下"
        onChange={(n) => set("y", n)}
      />
      <Slider
        label={`${label}の大きさ`}
        range="size"
        value={v.size}
        minLabel="小さく"
        maxLabel="大きく"
        onChange={(n) => set("size", n)}
      />
      <Slider
        label={`${label}の傾き`}
        range="rotation"
        value={v.rotation}
        minLabel="下がる"
        maxLabel="上がる"
        onChange={(n) => set("rotation", n)}
      />
      <Slider
        label={`${label}の間隔`}
        range="spacing"
        value={v.spacing}
        minLabel="寄せる"
        maxLabel="離す"
        onChange={(n) => set("spacing", n)}
      />
    </div>
  );
}

// トモコレの Mii づくりのように、パーツを選んで組み合わせ、位置や大きさを調整してアバターを作る
export function AvatarEditor({
  value,
  onChange,
  gender = "other",
  stickyClassName = "top-14",
}: {
  value: Avatar;
  onChange: (avatar: Avatar) => void;
  gender?: Gender;
  // プレビューを画面上部に固定するときの位置。上部バーの高さに合わせる
  stickyClassName?: string;
}) {
  const [category, setCategory] = useState<CategoryKey>("face");
  const a = value;
  const update = <K extends keyof Avatar>(key: K, patch: Partial<Avatar[K]>) =>
    onChange({ ...a, [key]: { ...(a[key] as object), ...patch } });
  const showFull = category === "body" || category === "favoriteColor";

  return (
    <div>
      <div
        className={cn("sticky z-10 border-b bg-background/95 backdrop-blur-xl", stickyClassName)}
      >
        <div className="flex items-end justify-center gap-4 px-4 pt-3">
          <div
            className="flex size-36 items-end justify-center overflow-hidden rounded-3xl"
            style={{
              background: `color-mix(in oklch, ${colorHex(favoriteColorOptions, a.favoriteColor)} 24%, white)`,
            }}
            data-testid="avatar-preview"
          >
            <AvatarFigure
              avatar={a}
              variant={showFull ? "full" : "bust"}
              className={showFull ? "h-full" : "size-full"}
              title="アバターのプレビュー"
            />
          </div>
          <div className="flex flex-col gap-2 pb-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange(generateRandomAvatar(Math.random, gender))}
            >
              <Dices />
              おまかせ
            </Button>
          </div>
        </div>
        <div className="scrollbar-none mt-2 flex gap-1 overflow-x-auto px-3 pb-2" role="tablist">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={category === c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                category === c.key ? "bg-foreground text-background" : "bg-muted hover:bg-muted/70",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 px-4 py-5" role="tabpanel">
        {category === "face" && (
          <>
            <Group title="輪郭">
              <PartGrid
                name="輪郭"
                options={faceShapeOptions}
                selected={a.face.shape}
                zoom={ZOOM.head}
                preview={(shape) => ({ ...a, face: { ...a.face, shape } })}
                onSelect={(shape) => update("face", { shape })}
              />
            </Group>
            <Group title="肌の色">
              <Swatches
                name="肌の色"
                options={skinColorOptions}
                selected={a.face.skinColor}
                onSelect={(id) => update("face", { skinColor: id as Avatar["face"]["skinColor"] })}
              />
            </Group>
            <Group title="ほっぺ">
              <PartGrid
                name="ほっぺ"
                options={cheekOptions}
                selected={a.face.cheek}
                zoom={ZOOM.beard}
                preview={(cheek) => ({ ...a, face: { ...a.face, cheek } })}
                onSelect={(cheek) => update("face", { cheek })}
              />
            </Group>
          </>
        )}

        {category === "hair" && (
          <>
            <Group title="髪型">
              <PartGrid
                name="髪型"
                options={hairStyleOptions}
                selected={a.hair.style}
                zoom={ZOOM.head}
                preview={(style) => ({ ...a, hair: { ...a.hair, style } })}
                onSelect={(style) => update("hair", { style })}
              />
            </Group>
            <Group title="髪の色">
              <Swatches
                name="髪の色"
                options={hairColorOptions}
                selected={a.hair.color}
                onSelect={(id) => update("hair", { color: id as Avatar["hair"]["color"] })}
              />
            </Group>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={a.hair.flip}
              onClick={() => update("hair", { flip: !a.hair.flip })}
            >
              <FlipHorizontal2 />
              分け目を左右反転
            </Button>
          </>
        )}

        {category === "eyebrow" && (
          <>
            <Group title="眉の形">
              <PartGrid
                name="眉"
                options={eyebrowStyleOptions}
                selected={a.eyebrow.style}
                zoom={ZOOM.brow}
                preview={(style) => ({ ...a, eyebrow: { ...a.eyebrow, style } })}
                onSelect={(style) => update("eyebrow", { style })}
              />
            </Group>
            <Group title="眉の色">
              <Swatches
                name="眉の色"
                options={hairColorOptions}
                selected={a.eyebrow.color}
                onSelect={(id) => update("eyebrow", { color: id as Avatar["eyebrow"]["color"] })}
              />
            </Group>
            <Group title="位置と大きさ">
              <FeatureSliders part="eyebrow" label="眉" avatar={a} onChange={onChange} />
            </Group>
          </>
        )}

        {category === "eye" && (
          <>
            <Group title="目の形">
              <PartGrid
                name="目"
                options={eyeStyleOptions}
                selected={a.eye.style}
                zoom={ZOOM.eye}
                preview={(style) => ({ ...a, eye: { ...a.eye, style } })}
                onSelect={(style) => update("eye", { style })}
              />
            </Group>
            <Group title="瞳の色">
              <Swatches
                name="瞳の色"
                options={eyeColorOptions}
                selected={a.eye.color}
                onSelect={(id) => update("eye", { color: id as Avatar["eye"]["color"] })}
              />
            </Group>
            <Group title="位置と大きさ">
              <FeatureSliders part="eye" label="目" avatar={a} onChange={onChange} />
            </Group>
          </>
        )}

        {category === "nose" && (
          <>
            <Group title="鼻の形">
              <PartGrid
                name="鼻"
                options={noseStyleOptions}
                selected={a.nose.style}
                zoom={ZOOM.nose}
                preview={(style) => ({ ...a, nose: { ...a.nose, style } })}
                onSelect={(style) => update("nose", { style })}
              />
            </Group>
            <Group title="位置と大きさ">
              <div className="grid gap-4 sm:grid-cols-2">
                <Slider
                  label="鼻の上下"
                  range="y"
                  value={a.nose.y}
                  minLabel="上"
                  maxLabel="下"
                  onChange={(y) => update("nose", { y })}
                />
                <Slider
                  label="鼻の大きさ"
                  range="size"
                  value={a.nose.size}
                  minLabel="小さく"
                  maxLabel="大きく"
                  onChange={(size) => update("nose", { size })}
                />
              </div>
            </Group>
          </>
        )}

        {category === "mouth" && (
          <>
            <Group title="口の形">
              <PartGrid
                name="口"
                options={mouthStyleOptions}
                selected={a.mouth.style}
                zoom={ZOOM.mouth}
                preview={(style) => ({ ...a, mouth: { ...a.mouth, style } })}
                onSelect={(style) => update("mouth", { style })}
              />
            </Group>
            <Group title="くちびるの色">
              <Swatches
                name="くちびるの色"
                options={lipColorOptions}
                selected={a.mouth.color}
                onSelect={(id) => update("mouth", { color: id as Avatar["mouth"]["color"] })}
              />
            </Group>
            <Group title="位置と大きさ">
              <div className="grid gap-4 sm:grid-cols-2">
                <Slider
                  label="口の上下"
                  range="y"
                  value={a.mouth.y}
                  minLabel="上"
                  maxLabel="下"
                  onChange={(y) => update("mouth", { y })}
                />
                <Slider
                  label="口の大きさ"
                  range="size"
                  value={a.mouth.size}
                  minLabel="小さく"
                  maxLabel="大きく"
                  onChange={(size) => update("mouth", { size })}
                />
              </div>
            </Group>
          </>
        )}

        {category === "facialHair" && (
          <>
            <Group title="口ひげ">
              <PartGrid
                name="口ひげ"
                options={mustacheStyleOptions}
                selected={a.facialHair.mustache}
                zoom={ZOOM.beard}
                preview={(mustache) => ({ ...a, facialHair: { ...a.facialHair, mustache } })}
                onSelect={(mustache) => update("facialHair", { mustache })}
              />
            </Group>
            <Group title="あごひげ">
              <PartGrid
                name="あごひげ"
                options={beardStyleOptions}
                selected={a.facialHair.beard}
                zoom={ZOOM.beard}
                preview={(beard) => ({ ...a, facialHair: { ...a.facialHair, beard } })}
                onSelect={(beard) => update("facialHair", { beard })}
              />
            </Group>
            <Group title="ヒゲの色">
              <Swatches
                name="ヒゲの色"
                options={hairColorOptions}
                selected={a.facialHair.color}
                onSelect={(id) =>
                  update("facialHair", { color: id as Avatar["facialHair"]["color"] })
                }
              />
            </Group>
          </>
        )}

        {category === "glasses" && (
          <>
            <Group title="メガネ">
              <PartGrid
                name="メガネ"
                options={glassesStyleOptions}
                selected={a.glasses.style}
                zoom={ZOOM.glasses}
                preview={(style) => ({ ...a, glasses: { ...a.glasses, style } })}
                onSelect={(style) => update("glasses", { style })}
              />
            </Group>
            <Group title="フレームの色">
              <Swatches
                name="フレームの色"
                options={glassesColorOptions}
                selected={a.glasses.color}
                onSelect={(id) => update("glasses", { color: id as Avatar["glasses"]["color"] })}
              />
            </Group>
            <Group title="大きさ">
              <Slider
                label="メガネの大きさ"
                range="size"
                value={a.glasses.size}
                minLabel="小さく"
                maxLabel="大きく"
                onChange={(size) => update("glasses", { size })}
              />
            </Group>
          </>
        )}

        {category === "mole" && (
          <>
            <Group title="ほくろ">
              <div className="flex gap-2">
                {[
                  { visible: false, label: "なし" },
                  { visible: true, label: "あり" },
                ].map((o) => (
                  <Button
                    key={o.label}
                    type="button"
                    variant={a.mole.visible === o.visible ? "default" : "outline"}
                    size="sm"
                    aria-pressed={a.mole.visible === o.visible}
                    onClick={() => update("mole", { visible: o.visible })}
                  >
                    ほくろ{o.label}
                  </Button>
                ))}
              </div>
            </Group>
            {a.mole.visible && (
              <Group title="位置">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Slider
                    label="ほくろの左右"
                    range="moleX"
                    value={a.mole.x}
                    minLabel="左"
                    maxLabel="右"
                    onChange={(x) => update("mole", { x })}
                  />
                  <Slider
                    label="ほくろの上下"
                    range="moleY"
                    value={a.mole.y}
                    minLabel="上"
                    maxLabel="下"
                    onChange={(y) => update("mole", { y })}
                  />
                </div>
              </Group>
            )}
          </>
        )}

        {category === "body" && (
          <Group title="体格">
            <div className="grid gap-4 sm:grid-cols-2">
              <Slider
                label="身長"
                range="body"
                value={a.body.height}
                minLabel="低い"
                maxLabel="高い"
                onChange={(height) => update("body", { height })}
              />
              <Slider
                label="体型"
                range="body"
                value={a.body.build}
                minLabel="細い"
                maxLabel="がっしり"
                onChange={(build) => update("body", { build })}
              />
            </div>
          </Group>
        )}

        {category === "favoriteColor" && (
          <Group title="好きな色（服の色になります）">
            <Swatches
              name="好きな色"
              options={favoriteColorOptions}
              selected={a.favoriteColor}
              onSelect={(id) => onChange({ ...a, favoriteColor: id as Avatar["favoriteColor"] })}
            />
          </Group>
        )}
      </div>
    </div>
  );
}
