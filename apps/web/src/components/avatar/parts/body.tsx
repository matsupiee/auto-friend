import type { Avatar } from "@auto-friend/avatar/avatar-schema";

// 体のパーツ。首から下を描く。体格（身長・体型）は 0〜100 で、50 が標準。
// 全身表示で、いちばん背が高いときの足元の y。これより低い人は下にずらして身長差を見せる。
export const FULL_BODY_FLOOR = 352;

const PANTS = "#3d4560";
const SHOES = "#2a2a2e";

type BodyProps = {
  body: Avatar["body"];
  skin: string;
  skinLine: string;
  shirt: string;
  shirtLine: string;
};

export function Neck({ skin }: { skin: string }) {
  return (
    <>
      <rect x={87} y={140} width={26} height={34} fill={skin} />
      <ellipse cx={100} cy={152} rx={13} ry={5} fill="rgba(120, 60, 40, 0.16)" />
    </>
  );
}

// 胸から上だけのアイコン用
export function Bust({ body, skin, shirt, shirtLine }: BodyProps) {
  const b = 0.85 + (body.build / 100) * 0.35;
  return (
    <>
      <path
        d={`M${100 - 72 * b} 204 C${100 - 70 * b} 180 ${100 - 46 * b} 168 86 166 L114 166 C${100 + 46 * b} 168 ${100 + 70 * b} 180 ${100 + 72 * b} 204 Z`}
        fill={shirt}
        stroke={shirtLine}
        strokeWidth={1.2}
      />
      <path d="M88 166 C92 176 108 176 112 166 Z" fill={skin} />
    </>
  );
}

export function fullBodyLength(body: Avatar["body"]) {
  const h = body.height / 100;
  const torso = 64 + h * 22;
  const legs = 56 + h * 44;
  return { torso, legs, bottom: 166 + torso + legs };
}

// 全身表示用。腕・胴・脚・靴を描く
export function FullBody({ body, skin, skinLine, shirt, shirtLine }: BodyProps) {
  const b = 0.8 + (body.build / 100) * 0.55;
  const { torso, legs } = fullBodyLength(body);
  const width = 70 * b;
  const armWidth = 15 * b;
  const legWidth = 22 * b;
  const legTop = 166 + torso - 8;
  const armX = width / 2 + armWidth / 2 - 5;
  return (
    <>
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * 9} ${100 + side * armX} 172)`}>
          <rect
            x={100 + side * armX - armWidth / 2}
            y={170}
            width={armWidth}
            height={torso * 0.82}
            rx={armWidth / 2}
            fill={shirt}
            stroke={shirtLine}
            strokeWidth={1.2}
          />
          <circle
            cx={100 + side * armX}
            cy={170 + torso * 0.82 + 3}
            r={armWidth * 0.5}
            fill={skin}
            stroke={skinLine}
            strokeWidth={1}
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
            rx={6}
            fill={PANTS}
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
        y={164}
        width={width}
        height={torso}
        rx={18 * b}
        fill={shirt}
        stroke={shirtLine}
        strokeWidth={1.2}
      />
      <path d="M88 165 C92 176 108 176 112 165 Z" fill={skin} />
    </>
  );
}
