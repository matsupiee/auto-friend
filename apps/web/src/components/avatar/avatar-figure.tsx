import {
  colorHex,
  eyeColorOptions,
  favoriteColorOptions,
  glassesColorOptions,
  hairColorOptions,
  lipColorOptions,
  skinColorOptions,
} from "@auto-friend/avatar/avatar-parts";
import type { Avatar } from "@auto-friend/avatar/avatar-schema";
import { useId } from "react";

import { Bust, FULL_BODY_FLOOR, FullBody, Neck, fullBodyLength } from "./parts/body";
import { cheeks } from "./parts/cheeks";
import { eyebrows } from "./parts/eyebrows";
import { eyeShapes } from "./parts/eyes";
import type { EyeShape } from "./parts/eyes";
import { beards, mustaches } from "./parts/facial-hair";
import { faceShapes } from "./parts/face-shapes";
import { glassesLenses } from "./parts/glasses";
import { CurlyBumps, hairStyles } from "./parts/hair-styles";
import { mouths } from "./parts/mouths";
import { noses } from "./parts/noses";
import { shadeColor } from "./shade-color";

// 顔の各パーツの標準位置（200×220 のキャンバス）と、調整値1目盛りあたりの動き
const EYE = { x: 26, y: 122 };
const BROW = { x: 26, y: 105 };
const EAR_Y = 122;
const NOSE_Y = 137;
const MOUTH_Y = 152;
const MOUTH_SCALE = 1.2;
const MOLE = { x: 124, y: 148 };
const STEP = { y: 1.6, size: 0.08, rotation: 5, spacing: 1.5, mole: 1.5 };
// 目や眉の線の色。真っ黒ではなく、こげ茶にするとやわらかく見える
const LINE = "#2a1c18";

// 髪は標準の輪郭（半幅 60・頭頂 52）、ヒゲは（半幅 60・あご先 178）に合わせて描いてある
const HAIR_BASE = { halfWidth: 60, top: 52 };
const BEARD_BASE = { halfWidth: 60, chin: 178 };
// 輪郭線（トゥーン線）。各パーツの色を暗くした細い線を、少し透かして引く
const OUTLINE = { width: 1.2, opacity: 0.55 };

export const BUST_VIEW_BOX = "-5 4 210 210";
const FULL_VIEW_BOX = "0 0 200 404";

const scaleOf = (size: number) => 1 + size * STEP.size;

// 左右対になるパーツ（目・眉・頬・レンズ）を、向かって左は x=-dx、右は反転して x=+dx に置く
function Pair({
  dx,
  y,
  scale = 1,
  rotation = 0,
  children,
}: {
  dx: number;
  y: number;
  scale?: number;
  rotation?: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <g transform={`translate(${100 - dx} ${y}) rotate(${rotation}) scale(${scale})`}>
        {children}
      </g>
      <g transform={`translate(${100 + dx} ${y}) scale(-1 1) rotate(${rotation}) scale(${scale})`}>
        {children}
      </g>
    </>
  );
}

function Eye({ shape, ballFill, skin }: { shape: EyeShape; ballFill: string; skin: string }) {
  if (shape.closed) {
    return (
      <path
        d={shape.closed.d}
        fill="none"
        stroke={LINE}
        strokeWidth={shape.closed.width}
        strokeLinecap="round"
      />
    );
  }
  const ball = shape.ball;
  return (
    <g transform={shape.rotate ? `rotate(${shape.rotate})` : undefined}>
      {ball && (
        <>
          <ellipse rx={ball.rx} ry={ball.ry} fill={ballFill} />
          <circle
            cx={ball.rx * 0.32}
            cy={-ball.ry * 0.34}
            r={Math.max(1.4, ball.rx * 0.25)}
            fill="white"
          />
        </>
      )}
      {shape.cover && <path d={shape.cover} fill={skin} />}
      {shape.lid && (
        <path
          d={shape.lid.d}
          fill="none"
          stroke={LINE}
          strokeWidth={shape.lid.width}
          strokeLinecap="round"
        />
      )}
      {shape.lashes && (
        <path d={shape.lashes} fill="none" stroke={LINE} strokeWidth={1.6} strokeLinecap="round" />
      )}
      {shape.crease && (
        <path
          d={shape.crease}
          fill="none"
          stroke={LINE}
          strokeWidth={1}
          strokeOpacity={0.55}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

// パーツを組み合わせてアバターを描く。bust は胸から上（アイコン用）、full は全身。
// 輪郭線はほとんど引かず、グラデーションとぼかした影で、LINE のアバターのような立体感を出す。
export function AvatarFigure({
  avatar,
  variant = "bust",
  viewBox,
  className,
  title,
}: {
  avatar: Avatar;
  variant?: "bust" | "full";
  // パーツ選びのサムネイルなどで、顔の一部だけを拡大して見せたいときに指定する
  viewBox?: string;
  className?: string;
  title?: string;
}) {
  // 同じ画面に何体並んでも、グラデーションや切り抜きの id がぶつからないようにする
  const uid = `av${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  const face = faceShapes[avatar.face.shape];
  const skin = colorHex(skinColorOptions, avatar.face.skinColor);
  const skinLine = shadeColor(skin, 0.38);
  const hair = colorHex(hairColorOptions, avatar.hair.color);
  const hairLine = shadeColor(hair, 0.42);
  const shirt = colorHex(favoriteColorOptions, avatar.favoriteColor);
  const shirtLine = shadeColor(shirt, 0.25);
  const lip = colorHex(lipColorOptions, avatar.mouth.color);
  const mouthLine = avatar.mouth.color === "natural" ? "#9a4a42" : shadeColor(lip, 0.25);
  const beardColor = colorHex(hairColorOptions, avatar.facialHair.color);
  const eyeColor = colorHex(eyeColorOptions, avatar.eye.color);

  const widthRatio = face.halfWidth / HAIR_BASE.halfWidth;
  const hairTransform = `translate(100 ${face.top - HAIR_BASE.top}) scale(${widthRatio} 1) translate(-100 0)${
    avatar.hair.flip ? " translate(200 0) scale(-1 1)" : ""
  }`;
  const beardTransform = `translate(100 ${face.chin}) scale(${face.halfWidth / BEARD_BASE.halfWidth} 1) translate(-100 -${BEARD_BASE.chin})`;

  const hairStyle = hairStyles[avatar.hair.style];
  const eyeShape = eyeShapes[avatar.eye.style];
  const eyeX = EYE.x + avatar.eye.spacing * STEP.spacing;
  const eyeY = EYE.y + avatar.eye.y * STEP.y;
  const browX = BROW.x + avatar.eyebrow.spacing * STEP.spacing;
  const browY = BROW.y + avatar.eyebrow.y * STEP.y;
  const mouthY = MOUTH_Y + avatar.mouth.y * STEP.y;
  const Eyebrow = eyebrows[avatar.eyebrow.style];
  const Nose = noses[avatar.nose.style];
  const Mouth = mouths[avatar.mouth.style];
  const Cheek = cheeks[avatar.face.cheek];
  const mustache = mustaches[avatar.facialHair.mustache];
  const beard = beards[avatar.facialHair.beard];
  const lens = glassesLenses[avatar.glasses.style];
  const glassesScale = scaleOf(avatar.glasses.size);
  const glassesColor = colorHex(glassesColorOptions, avatar.glasses.color);

  const bodyProps = { body: avatar.body, skin, skinLine, shirt: url("shirt"), shirtLine };
  const full = variant === "full";
  const offsetY = full ? FULL_BODY_FLOOR - fullBodyLength(avatar.body).bottom : 0;
  const frontOpacity = hairStyle.frontOpacity ?? 1;
  const mouthScale = scaleOf(avatar.mouth.size) * MOUTH_SCALE;

  return (
    <svg
      viewBox={viewBox ?? (full ? FULL_VIEW_BOX : BUST_VIEW_BOX)}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {/* 顔は真ん中を明るく、ふちを少し暗くして丸みを出す */}
        <radialGradient id={id("skin")} cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor={shadeColor(skin, -0.07)} />
          <stop offset="0.65" stopColor={skin} />
          <stop offset="1" stopColor={shadeColor(skin, 0.07)} />
        </radialGradient>
        <linearGradient id={id("neck")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(150 80 60)" stopOpacity={0.55} />
          <stop offset="0.75" stopColor="rgb(150 80 60)" stopOpacity={0.06} />
        </linearGradient>
        {/* 前髪とはねた毛先で同じ色になるよう、キャンバス上の位置でグラデーションをかける */}
        <linearGradient
          id={id("hair")}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="10"
          x2="0"
          y2="200"
        >
          <stop offset="0" stopColor={shadeColor(hair, -0.1)} />
          <stop offset="0.5" stopColor={hair} />
          <stop offset="1" stopColor={shadeColor(hair, 0.18)} />
        </linearGradient>
        {/* 後ろ髪は前髪より暗くして、層を分ける */}
        <linearGradient id={id("hairBack")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shadeColor(hair, 0.12)} />
          <stop offset="1" stopColor={shadeColor(hair, 0.28)} />
        </linearGradient>
        <linearGradient id={id("shirt")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shadeColor(shirt, -0.12)} />
          <stop offset="1" stopColor={shadeColor(shirt, 0.14)} />
        </linearGradient>
        <linearGradient id={id("eye")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shadeColor(eyeColor, 0.72)} />
          <stop offset="1" stopColor={shadeColor(eyeColor, 0.42)} />
        </linearGradient>
        <radialGradient id={id("blush")}>
          <stop offset="0" stopColor="#ff8f9f" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ff8f9f" stopOpacity={0} />
        </radialGradient>
        <filter id={id("shadow")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id={id("glow")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <clipPath id={id("face")}>
          <path d={face.d} />
        </clipPath>
        {hairStyle.front && (
          <clipPath id={id("front")}>
            <path d={hairStyle.front} />
          </clipPath>
        )}
      </defs>

      <g transform={`translate(0 ${offsetY})`}>
        {/* 後ろ髪 */}
        <g transform={hairTransform}>
          {avatar.hair.style === "curly" && <CurlyBumps fill={url("hair")} stroke={hairLine} />}
          {hairStyle.back && (
            <path
              d={hairStyle.back}
              fill={url("hairBack")}
              stroke={hairLine}
              strokeWidth={OUTLINE.width}
              strokeOpacity={OUTLINE.opacity}
            />
          )}
        </g>

        {/* 首から下 */}
        {full ? <FullBody {...bodyProps} /> : null}
        <Neck skin={skin} shade={url("neck")} />
        {full ? null : <Bust {...bodyProps} />}

        {/* 耳と輪郭 */}
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse
              cx={100 + side * (face.halfWidth - 1)}
              cy={EAR_Y}
              rx={10}
              ry={13}
              fill={skin}
              stroke={skinLine}
              strokeWidth={OUTLINE.width}
              strokeOpacity={OUTLINE.opacity}
            />
            <ellipse
              cx={100 + side * (face.halfWidth + 1)}
              cy={EAR_Y + 1}
              rx={4.6}
              ry={7.6}
              fill={shadeColor(skin, 0.2)}
              opacity={0.6}
            />
          </g>
        ))}
        <path
          d={face.d}
          fill={url("skin")}
          stroke={skinLine}
          strokeWidth={OUTLINE.width}
          strokeOpacity={OUTLINE.opacity}
        />

        {/* 前髪が顔に落とす、ぼかした影 */}
        {hairStyle.front && (
          <g clipPath={url("face")}>
            <g transform={`translate(0 5) ${hairTransform}`} filter={url("shadow")}>
              <path
                d={hairStyle.front}
                fill={shadeColor(skin, 0.4)}
                opacity={0.32 * frontOpacity}
              />
            </g>
          </g>
        )}

        {/* 頬・ほくろ */}
        {Cheek && (
          <Pair dx={eyeX + 5} y={eyeY + 14}>
            <Cheek blushFill={url("blush")} />
          </Pair>
        )}
        {avatar.mole.visible && (
          <circle
            cx={MOLE.x + avatar.mole.x * STEP.mole}
            cy={MOLE.y + avatar.mole.y * STEP.mole}
            r={1.4}
            fill="#5a3d33"
          />
        )}

        {/* あごひげ → 口 → 口ひげ → 鼻 → 目 */}
        {beard && (
          <path
            d={beard.d}
            transform={beardTransform}
            fill={beard.stroke ? "none" : beardColor}
            stroke={beard.stroke ? beardColor : "none"}
            strokeWidth={beard.stroke}
            strokeLinecap="round"
            opacity={beard.opacity}
          />
        )}
        <g transform={`translate(100 ${mouthY}) scale(${mouthScale})`}>
          <Mouth lip={lip} line={mouthLine} />
        </g>
        {mustache && (
          <path
            d={mustache}
            transform={`translate(100 ${mouthY - 7}) scale(${mouthScale})`}
            fill={beardColor}
          />
        )}
        <g
          transform={`translate(100 ${NOSE_Y + avatar.nose.y * STEP.y}) scale(${scaleOf(avatar.nose.size)})`}
        >
          <Nose />
        </g>
        <Pair
          dx={eyeX}
          y={eyeY}
          scale={scaleOf(avatar.eye.size)}
          rotation={avatar.eye.rotation * STEP.rotation}
        >
          <Eye shape={eyeShape} ballFill={url("eye")} skin={skin} />
        </Pair>

        {/* 前髪（グラデーション＋ツヤ） → 眉（前髪の上に透けて見えるように） → メガネ */}
        <g transform={hairTransform}>
          {hairStyle.flicks && (
            <path
              d={hairStyle.flicks}
              fill={url("hair")}
              stroke={hairLine}
              strokeWidth={OUTLINE.width}
              strokeOpacity={OUTLINE.opacity}
            />
          )}
          {hairStyle.front && (
            <>
              <path
                d={hairStyle.front}
                fill={url("hair")}
                fillOpacity={frontOpacity}
                stroke={hairLine}
                strokeWidth={OUTLINE.width}
                strokeOpacity={OUTLINE.opacity * frontOpacity}
              />
              {hairStyle.details && (
                <path
                  d={hairStyle.details}
                  fill="none"
                  stroke={hairLine}
                  strokeWidth={1.2}
                  strokeOpacity={0.22}
                  strokeLinecap="round"
                />
              )}
              {/* ツヤは白ではなく髪色を明るくした色で、毛流れに沿った細い三日月形にする */}
              <g clipPath={url("front")} filter={url("glow")} opacity={frontOpacity}>
                <path
                  d="M40 76 C46 50 66 30 94 22 C74 36 58 54 52 78 Z"
                  fill={shadeColor(hair, -0.4)}
                  opacity={0.4}
                />
                <path
                  d="M118 20 C136 22 152 30 164 44 C150 36 136 30 118 26 Z"
                  fill={shadeColor(hair, -0.4)}
                  opacity={0.3}
                />
              </g>
            </>
          )}
          {hairStyle.accessory?.(shirt, shirtLine)}
        </g>
        <Pair
          dx={browX}
          y={browY}
          scale={scaleOf(avatar.eyebrow.size)}
          rotation={avatar.eyebrow.rotation * STEP.rotation}
        >
          <Eyebrow color={shadeColor(colorHex(hairColorOptions, avatar.eyebrow.color), 0.12)} />
        </Pair>
        {lens && (
          <g>
            <path
              d={`M${100 - eyeX + lens.halfWidth * glassesScale} ${eyeY - 2} Q100 ${eyeY - 6} ${100 + eyeX - lens.halfWidth * glassesScale} ${eyeY - 2}`}
              fill="none"
              stroke={glassesColor}
              strokeWidth={2}
            />
            {[-1, 1].map((side) => (
              <path
                key={side}
                d={`M${100 + side * (eyeX + lens.halfWidth * glassesScale)} ${eyeY - 3} L${100 + side * (face.halfWidth - 1)} ${eyeY - 2}`}
                stroke={glassesColor}
                strokeWidth={2}
              />
            ))}
            <Pair dx={eyeX} y={eyeY} scale={glassesScale}>
              {lens.render(glassesColor)}
            </Pair>
          </g>
        )}
      </g>
    </svg>
  );
}
