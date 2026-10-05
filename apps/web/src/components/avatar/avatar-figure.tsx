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

// 顔の各パーツの標準位置（200×220 のキャンバス）と、調整値1目盛りあたりの動き。
// 目を顔の下寄りに大きく置くと、幼くかわいい印象になる。
const EYE = { x: 27, y: 123, scale: 1.3 };
const BROW = { x: 25, y: 101 };
const NOSE_Y = 139;
const MOUTH_Y = 153;
const MOLE = { x: 124, y: 150 };
const STEP = { y: 1.6, size: 0.08, rotation: 5, spacing: 1.5, mole: 1.5 };
// 線の色。真っ黒ではなく、こげ茶にするとやわらかく見える
const LINE = "#3b2621";

// 髪とヒゲは、標準の輪郭（半幅 60・頭頂 50・あご先 178）に合わせて描いてある
const BASE = { halfWidth: 60, top: 50, chin: 178 };
const HAIR_VOLUME = { x: 1.05, y: 1.03 };

export const BUST_VIEW_BOX = "-5 4 210 210";
const FULL_VIEW_BOX = "0 0 200 372";

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

function Eye({ shape, clipId, irisFill }: { shape: EyeShape; clipId: string; irisFill: string }) {
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
  const iris = shape.iris;
  return (
    <g transform={shape.rotate ? `rotate(${shape.rotate})` : undefined}>
      {shape.sclera && <path d={shape.sclera} fill="white" />}
      {iris && (
        <g clipPath={shape.sclera ? `url(#${clipId})` : undefined}>
          <ellipse cx={iris.cx} cy={iris.cy} rx={iris.rx} ry={iris.ry} fill={irisFill} />
          <ellipse
            cx={iris.cx}
            cy={iris.cy + iris.ry * 0.1}
            rx={iris.rx * 0.46}
            ry={iris.ry * 0.48}
            fill="#160e0c"
          />
          <circle
            cx={iris.cx - iris.rx * 0.36}
            cy={iris.cy - iris.ry * 0.36}
            r={iris.rx * 0.36}
            fill="white"
          />
          <circle
            cx={iris.cx + iris.rx * 0.36}
            cy={iris.cy + iris.ry * 0.42}
            r={iris.rx * 0.16}
            fill="white"
            fillOpacity={0.9}
          />
        </g>
      )}
      {shape.sclera && (
        <path d={shape.sclera} fill="none" stroke={LINE} strokeWidth={0.9} strokeOpacity={0.35} />
      )}
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
        <path d={shape.lashes} fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      )}
      {shape.crease && (
        <path
          d={shape.crease}
          fill="none"
          stroke={LINE}
          strokeWidth={1.2}
          strokeOpacity={0.7}
          strokeLinecap="round"
        />
      )}
      {shape.lower && (
        <path
          d={shape.lower}
          fill="none"
          stroke={LINE}
          strokeWidth={1}
          strokeOpacity={0.45}
          strokeLinecap="round"
        />
      )}
    </g>
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
  // 同じ画面に何体並んでも、グラデーションや切り抜きの id がぶつからないようにする
  const uid = `av${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = {
    iris: `${uid}-iris`,
    blush: `${uid}-blush`,
    sclera: `${uid}-sclera`,
    face: `${uid}-face`,
  };

  const face = faceShapes[avatar.face.shape];
  const skin = colorHex(skinColorOptions, avatar.face.skinColor);
  const skinLine = shadeColor(skin, 0.4);
  const hair = colorHex(hairColorOptions, avatar.hair.color);
  const hairLine = shadeColor(hair, 0.45);
  const shirt = colorHex(favoriteColorOptions, avatar.favoriteColor);
  const shirtLine = shadeColor(shirt, 0.35);
  const lip = colorHex(lipColorOptions, avatar.mouth.color);
  const mouthLine = avatar.mouth.color === "natural" ? "#8a3a32" : shadeColor(lip, 0.3);
  const beardColor = colorHex(hairColorOptions, avatar.facialHair.color);
  const eyeColor = colorHex(eyeColorOptions, avatar.eye.color);

  const widthRatio = face.halfWidth / BASE.halfWidth;
  // 髪は顔より少しだけ大きくして、ふんわりしたボリュームを出す
  const hairTransform = `translate(100 ${face.top - BASE.top + 120}) scale(${widthRatio * HAIR_VOLUME.x} ${HAIR_VOLUME.y}) translate(-100 -120)${
    avatar.hair.flip ? " translate(200 0) scale(-1 1)" : ""
  }`;
  const beardTransform = `translate(100 ${face.chin}) scale(${widthRatio} 1) translate(-100 -${BASE.chin})`;

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
  const glassesScale = scaleOf(avatar.glasses.size) * 1.12;
  const glassesColor = colorHex(glassesColorOptions, avatar.glasses.color);

  const bodyProps = { body: avatar.body, skin, skinLine, shirt, shirtLine };
  const full = variant === "full";
  const offsetY = full ? FULL_BODY_FLOOR - fullBodyLength(avatar.body).bottom : 0;
  const frontOpacity = hairStyle.frontOpacity ?? 1;

  return (
    <svg
      viewBox={viewBox ?? (full ? FULL_VIEW_BOX : BUST_VIEW_BOX)}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {/* 瞳は上を濃く、下を明るくして、うるっとしたツヤを出す */}
        <linearGradient id={ids.iris} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shadeColor(eyeColor, 0.55)} />
          <stop offset="0.55" stopColor={eyeColor} />
          <stop offset="1" stopColor={shadeColor(eyeColor, -0.35)} />
        </linearGradient>
        <radialGradient id={ids.blush}>
          <stop offset="0" stopColor="#ff8aa0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff8aa0" stopOpacity={0} />
        </radialGradient>
        {eyeShape.sclera && (
          <clipPath id={ids.sclera}>
            <path d={eyeShape.sclera} />
          </clipPath>
        )}
        <clipPath id={ids.face}>
          <path d={face.d} />
        </clipPath>
      </defs>

      <g transform={`translate(0 ${offsetY})`}>
        {/* 後ろ髪 */}
        <g transform={hairTransform} strokeLinejoin="round">
          {avatar.hair.style === "curly" && <CurlyBumps fill={hair} stroke={hairLine} />}
          {hairStyle.back && (
            <path d={hairStyle.back} fill={hair} stroke={hairLine} strokeWidth={2} />
          )}
        </g>

        {/* 首から下 */}
        {full ? <FullBody {...bodyProps} /> : null}
        <Neck skin={skin} skinLine={skinLine} />
        {full ? null : <Bust {...bodyProps} />}

        {/* 耳と輪郭 */}
        {[-1, 1].map((side) => (
          <g key={side}>
            <ellipse
              cx={100 + side * (face.halfWidth - 1)}
              cy={122}
              rx={7}
              ry={9.5}
              fill={skin}
              stroke={skinLine}
              strokeWidth={1.8}
            />
            <path
              d={`M${100 + side * (face.halfWidth + 1)} 118 C${100 + side * (face.halfWidth + 3)} 122 ${100 + side * (face.halfWidth + 2)} 126 ${100 + side * face.halfWidth} 128`}
              fill="none"
              stroke={skinLine}
              strokeWidth={1.2}
              strokeOpacity={0.6}
              strokeLinecap="round"
            />
          </g>
        ))}
        <path d={face.d} fill={skin} stroke={skinLine} strokeWidth={2} />

        {/* 前髪が額に落とす影 */}
        {hairStyle.front && (
          <g clipPath={`url(#${ids.face})`}>
            <g transform={`translate(0 4) ${hairTransform}`}>
              <path d={hairStyle.front} fill="rgba(150, 80, 60, 0.2)" opacity={frontOpacity} />
            </g>
          </g>
        )}

        {/* 頬・ほくろ */}
        {Cheek && (
          <Pair dx={eyeX + 6} y={eyeY + 20}>
            <Cheek blushFill={`url(#${ids.blush})`} />
          </Pair>
        )}
        {avatar.mole.visible && (
          <circle
            cx={MOLE.x + avatar.mole.x * STEP.mole}
            cy={MOLE.y + avatar.mole.y * STEP.mole}
            r={1.5}
            fill="#4a332b"
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
            transform={`translate(100 ${mouthY - 7}) scale(${scaleOf(avatar.mouth.size)})`}
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
          <Eye shape={eyeShape} clipId={ids.sclera} irisFill={`url(#${ids.iris})`} />
        </Pair>

        {/* 前髪 → 眉（前髪の上に透けて見えるように） → メガネ */}
        <g transform={hairTransform} strokeLinejoin="round" strokeLinecap="round">
          {hairStyle.front && (
            <path
              d={hairStyle.front}
              fill={hair}
              fillOpacity={frontOpacity}
              stroke={hairLine}
              strokeWidth={2}
              strokeOpacity={frontOpacity}
            />
          )}
          {hairStyle.details && (
            <path
              d={hairStyle.details}
              fill="none"
              stroke={hairLine}
              strokeWidth={1.4}
              strokeOpacity={0.55}
            />
          )}
          {hairStyle.shine && (
            <path
              d="M54 70 C58 56 66 46 78 39 M112 32 C119 32 125 33 131 36"
              fill="none"
              stroke="white"
              strokeOpacity={0.45}
              strokeWidth={4.5}
            />
          )}
          {hairStyle.accessory?.(shirt, shirtLine)}
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
              strokeWidth={2.2}
            />
            {[-1, 1].map((side) => (
              <path
                key={side}
                d={`M${100 + side * (eyeX + lens.halfWidth * glassesScale)} ${eyeY - 3} L${100 + side * (face.halfWidth + 1)} ${eyeY - 1}`}
                stroke={glassesColor}
                strokeWidth={2.2}
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
