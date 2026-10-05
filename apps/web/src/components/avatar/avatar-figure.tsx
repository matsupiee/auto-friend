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

import { Bust, FULL_BODY_FLOOR, FullBody, Neck, fullBodyLength } from "./parts/body";
import { cheeks } from "./parts/cheeks";
import { eyebrows } from "./parts/eyebrows";
import { eyes } from "./parts/eyes";
import { beards, mustaches } from "./parts/facial-hair";
import { faceShapes } from "./parts/face-shapes";
import { glassesLenses } from "./parts/glasses";
import { CurlyBumps, hairStyles } from "./parts/hair-styles";
import { mouths } from "./parts/mouths";
import { noses } from "./parts/noses";
import { shadeColor } from "./shade-color";

// 顔の各パーツの標準位置（200×200 の顔キャンバス）と、調整値1目盛りあたりの動き
const EYE = { x: 21, y: 104, scale: 1.15 };
const BROW = { x: 22, y: 86 };
const NOSE_Y = 122;
const MOUTH_Y = 141;
const STEP = { y: 1.6, size: 0.08, rotation: 5, spacing: 1.5, mole: 1.5 };

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

// パーツを組み合わせてアバターを描く。bust は胸から上（アイコン用）、full は全身。
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
  const face = faceShapes[avatar.face.shape];
  const skin = colorHex(skinColorOptions, avatar.face.skinColor);
  const skinLine = shadeColor(skin, 0.28);
  const hair = colorHex(hairColorOptions, avatar.hair.color);
  const hairLine = shadeColor(hair, 0.3);
  const shirt = colorHex(favoriteColorOptions, avatar.favoriteColor);
  const shirtLine = shadeColor(shirt, 0.22);
  const lip = colorHex(lipColorOptions, avatar.mouth.color);
  const mouthLine = avatar.mouth.color === "natural" ? "#8a3d33" : shadeColor(lip, 0.25);
  const beardColor = colorHex(hairColorOptions, avatar.facialHair.color);

  // 髪とヒゲは、標準の輪郭（半幅 56・頭頂 46）から、選んだ輪郭へ伸縮させる
  const widthRatio = face.halfWidth / 56;
  const hairTransform = `translate(100 ${face.top - 46}) scale(${widthRatio} 1) translate(-100 0)${
    avatar.hair.flip ? " translate(200 0) scale(-1 1)" : ""
  }`;
  const beardTransform = `translate(100 ${face.chin}) scale(${widthRatio} 1) translate(-100 -166)`;

  const hairStyle = hairStyles[avatar.hair.style];
  const eyeX = EYE.x + avatar.eye.spacing * STEP.spacing;
  const eyeY = EYE.y + avatar.eye.y * STEP.y;
  const browX = BROW.x + avatar.eyebrow.spacing * STEP.spacing;
  const browY = BROW.y + avatar.eyebrow.y * STEP.y;
  const mouthY = MOUTH_Y + avatar.mouth.y * STEP.y;
  const Eye = eyes[avatar.eye.style];
  const Eyebrow = eyebrows[avatar.eyebrow.style];
  const Nose = noses[avatar.nose.style];
  const Mouth = mouths[avatar.mouth.style];
  const Cheek = cheeks[avatar.face.cheek];
  const mustache = mustaches[avatar.facialHair.mustache];
  const beard = beards[avatar.facialHair.beard];
  const lens = glassesLenses[avatar.glasses.style];
  const glassesScale = scaleOf(avatar.glasses.size);
  const glassesColor = colorHex(glassesColorOptions, avatar.glasses.color);

  const bodyProps = { body: avatar.body, skin, skinLine, shirt, shirtLine };
  const full = variant === "full";
  const offsetY = full ? FULL_BODY_FLOOR - fullBodyLength(avatar.body).bottom : 0;

  return (
    <svg
      viewBox={viewBox ?? (full ? "0 -2 200 360" : "0 0 200 200")}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g transform={`translate(0 ${offsetY})`}>
        {/* 後ろ髪 */}
        <g transform={hairTransform}>
          {avatar.hair.style === "curly" && <CurlyBumps fill={hair} stroke={hairLine} />}
          {hairStyle.back && (
            <path d={hairStyle.back} fill={hair} stroke={hairLine} strokeWidth={1.2} />
          )}
        </g>

        {/* 首から下 */}
        {full ? <FullBody {...bodyProps} /> : null}
        <Neck skin={skin} />
        {full ? null : <Bust {...bodyProps} />}

        {/* 耳と輪郭 */}
        {[-1, 1].map((side) => (
          <ellipse
            key={side}
            cx={100 + side * (face.halfWidth + 1)}
            cy={110}
            rx={8}
            ry={12}
            fill={skin}
            stroke={skinLine}
            strokeWidth={1.2}
          />
        ))}
        <path d={face.d} fill={skin} stroke={skinLine} strokeWidth={1.2} />

        {/* 頬・ほくろ */}
        {Cheek && (
          <Pair dx={eyeX + 9} y={eyeY + 22}>
            <Cheek />
          </Pair>
        )}
        {avatar.mole.visible && (
          <circle
            cx={118 + avatar.mole.x * STEP.mole}
            cy={136 + avatar.mole.y * STEP.mole}
            r={1.7}
            fill="#3a2a24"
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
        <g transform={`translate(100 ${mouthY}) scale(${scaleOf(avatar.mouth.size)})`}>
          <Mouth lip={lip} line={mouthLine} />
        </g>
        {mustache && (
          <path
            d={mustache}
            transform={`translate(100 ${mouthY - 8}) scale(${scaleOf(avatar.mouth.size)})`}
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
          scale={scaleOf(avatar.eye.size) * EYE.scale}
          rotation={avatar.eye.rotation * STEP.rotation}
        >
          <Eye color={colorHex(eyeColorOptions, avatar.eye.color)} />
        </Pair>

        {/* 前髪 → 眉（前髪の上に透けて見えるように） → メガネ */}
        <g transform={hairTransform}>
          {hairStyle.front && (
            <path
              d={hairStyle.front}
              fill={hair}
              fillOpacity={hairStyle.frontOpacity ?? 1}
              stroke={hairLine}
              strokeWidth={1.2}
              strokeOpacity={hairStyle.frontOpacity ?? 1}
            />
          )}
          {hairStyle.accessory?.(shirt)}
        </g>
        <Pair
          dx={browX}
          y={browY}
          scale={scaleOf(avatar.eyebrow.size)}
          rotation={avatar.eyebrow.rotation * STEP.rotation}
        >
          <Eyebrow color={colorHex(hairColorOptions, avatar.eyebrow.color)} />
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
                d={`M${100 + side * (eyeX + lens.halfWidth * glassesScale)} ${eyeY - 3} L${100 + side * (face.halfWidth + 2)} ${eyeY - 1}`}
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
