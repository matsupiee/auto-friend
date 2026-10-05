import type { Avatar } from "@auto-friend/avatar/avatar-schema";

// 体のパーツ。首から下を描く。体格（身長・体型）は 0〜100 で、50 が標準。
// 服は好きな色のトップスに白い襟。全身表示で、いちばん背が高いときの足元の y を FULL_BODY_FLOOR とし、
// これより低い人は下にずらして身長差を見せる。
export const FULL_BODY_FLOOR = 366;
const NECK_BOTTOM = 182;

const PANTS = "#3f4a6b";
const SHOES = "#5b4335";
const COLLAR = "#fbfbf8";

type BodyProps = {
  body: Avatar["body"];
  skin: string;
  skinLine: string;
  shirt: string;
  shirtLine: string;
};

export function Neck({ skin, skinLine }: { skin: string; skinLine: string }) {
  return (
    <>
      <path
        d="M90 160 L90 186 L110 186 L110 160 Z"
        fill={skin}
        stroke={skinLine}
        strokeWidth={1.6}
      />
      <ellipse cx={100} cy={168} rx={11} ry={5} fill="rgba(150, 80, 60, 0.18)" />
    </>
  );
}

function Collar({ line }: { line: string }) {
  return (
    <g fill={COLLAR} stroke={line} strokeWidth={1.6} strokeLinejoin="round">
      <path
        d={`M89 ${NECK_BOTTOM - 3} L100 ${NECK_BOTTOM + 9} L93 ${NECK_BOTTOM + 15} L82 ${NECK_BOTTOM + 3} Z`}
      />
      <path
        d={`M111 ${NECK_BOTTOM - 3} L100 ${NECK_BOTTOM + 9} L107 ${NECK_BOTTOM + 15} L118 ${NECK_BOTTOM + 3} Z`}
      />
    </g>
  );
}

// 胸から上だけのアイコン用
export function Bust({ body, skin, shirt, shirtLine }: BodyProps) {
  const b = 0.88 + (body.build / 100) * 0.3;
  return (
    <>
      <path
        d={`M${100 - 64 * b} 224 C${100 - 64 * b} 202 ${100 - 48 * b} ${NECK_BOTTOM + 2} 88 ${NECK_BOTTOM} L112 ${NECK_BOTTOM} C${100 + 48 * b} ${NECK_BOTTOM + 2} ${100 + 64 * b} 202 ${100 + 64 * b} 224 Z`}
        fill={shirt}
        stroke={shirtLine}
        strokeWidth={1.8}
      />
      <path
        d={`M89 ${NECK_BOTTOM - 1} C92 ${NECK_BOTTOM + 8} 108 ${NECK_BOTTOM + 8} 111 ${NECK_BOTTOM - 1} Z`}
        fill={skin}
      />
      <Collar line={shirtLine} />
    </>
  );
}

export function fullBodyLength(body: Avatar["body"]) {
  const h = body.height / 100;
  const torso = 62 + h * 22;
  const legs = 52 + h * 44;
  return { torso, legs, bottom: NECK_BOTTOM + torso + legs };
}

// 全身表示用。腕・胴・脚・靴を描く
export function FullBody({ body, skin, skinLine, shirt, shirtLine }: BodyProps) {
  const b = 0.8 + (body.build / 100) * 0.5;
  const { torso, legs } = fullBodyLength(body);
  const width = 64 * b;
  const armWidth = 15 * b;
  const legWidth = 21 * b;
  const top = NECK_BOTTOM - 2;
  const legTop = top + torso - 8;
  const armX = width / 2 + armWidth / 2 - 5;
  return (
    <>
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * 10} ${100 + side * armX} ${top + 6})`}>
          <rect
            x={100 + side * armX - armWidth / 2}
            y={top + 4}
            width={armWidth}
            height={torso * 0.8}
            rx={armWidth / 2}
            fill={shirt}
            stroke={shirtLine}
            strokeWidth={1.6}
          />
          <circle
            cx={100 + side * armX}
            cy={top + 4 + torso * 0.8 + 3}
            r={armWidth * 0.52}
            fill={skin}
            stroke={skinLine}
            strokeWidth={1.4}
          />
        </g>
      ))}
      {[-1, 1].map((side) => (
        <g key={`leg${side}`}>
          <rect
            x={side < 0 ? 100 - 2 - legWidth : 102}
            y={legTop}
            width={legWidth}
            height={legs}
            rx={7}
            fill={PANTS}
            stroke="#2c3550"
            strokeWidth={1.4}
          />
          <ellipse
            cx={100 + side * (2 + legWidth / 2 + 2)}
            cy={legTop + legs + 1}
            rx={legWidth / 2 + 4}
            ry={6}
            fill={SHOES}
          />
        </g>
      ))}
      <rect
        x={100 - width / 2}
        y={top}
        width={width}
        height={torso}
        rx={18 * b}
        fill={shirt}
        stroke={shirtLine}
        strokeWidth={1.8}
      />
      <path
        d={`M89 ${NECK_BOTTOM - 1} C92 ${NECK_BOTTOM + 8} 108 ${NECK_BOTTOM + 8} 111 ${NECK_BOTTOM - 1} Z`}
        fill={skin}
      />
      <Collar line={shirtLine} />
    </>
  );
}
