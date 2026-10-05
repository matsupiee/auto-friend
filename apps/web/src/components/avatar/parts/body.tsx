import type { Avatar } from "@auto-friend/avatar/avatar-schema";

// 体のパーツ。首から下を描く。体格（身長・体型）は 0〜100 で、50 が標準。
// 服は好きな色のトップスに白い襟。shirt にはグラデーション（url(#...)）も渡せる。
// 全身表示で、いちばん背が高いときの足元の y を FULL_BODY_FLOOR とし、
// これより低い人は下にずらして身長差を見せる。
export const FULL_BODY_FLOOR = 396;
const NECK_BOTTOM = 182;

const PANTS = "#46506e";
const SHOES = "#5b4335";
const COLLAR = "#fbfbf8";

type BodyProps = {
  body: Avatar["body"];
  skin: string;
  skinLine: string;
  shirt: string;
  shirtLine: string;
};

// 首。あごの下は影になるので、上を濃くしたグラデーション（shade）を重ねる
export function Neck({ skin, shade }: { skin: string; shade: string }) {
  return (
    <>
      <path d="M86 150 L86 188 L114 188 L114 150 Z" fill={skin} />
      <path d="M86 150 L86 188 L114 188 L114 150 Z" fill={shade} />
    </>
  );
}

function Collar() {
  return (
    <g fill={COLLAR} stroke="#d9d6cf" strokeWidth={0.8} strokeLinejoin="round">
      <path
        d={`M90 ${NECK_BOTTOM - 3} L100 ${NECK_BOTTOM + 9} L93 ${NECK_BOTTOM + 15} L83 ${NECK_BOTTOM + 3} Z`}
      />
      <path
        d={`M110 ${NECK_BOTTOM - 3} L100 ${NECK_BOTTOM + 9} L107 ${NECK_BOTTOM + 15} L117 ${NECK_BOTTOM + 3} Z`}
      />
    </g>
  );
}

function Neckline({ skin }: { skin: string }) {
  return (
    <path
      d={`M90 ${NECK_BOTTOM - 1} C93 ${NECK_BOTTOM + 8} 107 ${NECK_BOTTOM + 8} 110 ${NECK_BOTTOM - 1} Z`}
      fill={skin}
    />
  );
}

// 胸から上だけのアイコン用
export function Bust({ body, skin, shirt, shirtLine }: BodyProps) {
  const b = 0.86 + (body.build / 100) * 0.3;
  return (
    <>
      <path
        d={`M${100 - 64 * b} 226 C${100 - 64 * b} 204 ${100 - 50 * b} ${NECK_BOTTOM + 2} 88 ${NECK_BOTTOM} L112 ${NECK_BOTTOM} C${100 + 50 * b} ${NECK_BOTTOM + 2} ${100 + 64 * b} 204 ${100 + 64 * b} 226 Z`}
        fill={shirt}
        stroke={shirtLine}
        strokeWidth={0.8}
        strokeOpacity={0.6}
      />
      <Neckline skin={skin} />
      <Collar />
    </>
  );
}

export function fullBodyLength(body: Avatar["body"]) {
  const h = body.height / 100;
  const torso = 62 + h * 22;
  // 脚を長めにして、2.7〜3 頭身にする
  const legs = (52 + h * 44) * 1.3;
  return { torso, legs, bottom: NECK_BOTTOM + torso + legs };
}

// 全身表示用。腕・胴・脚・靴を描く
export function FullBody({ body, skin, skinLine, shirt, shirtLine }: BodyProps) {
  const b = 0.8 + (body.build / 100) * 0.5;
  const { torso, legs } = fullBodyLength(body);
  const width = 80 * b;
  const armWidth = 17 * b;
  const legWidth = 25 * b;
  const top = NECK_BOTTOM - 2;
  const legTop = top + torso - 8;
  // 肩の付け根を胴にめり込ませ、外へ少しだけ開く
  const armX = width / 2 + armWidth / 2 - 10;
  return (
    <>
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * 7} ${100 + side * armX} ${top + 6})`}>
          <rect
            x={100 + side * armX - armWidth / 2}
            y={top + 4}
            width={armWidth}
            height={torso * 0.8}
            rx={armWidth / 2}
            fill={shirt}
            stroke={shirtLine}
            strokeWidth={0.8}
            strokeOpacity={0.6}
          />
          <circle
            cx={100 + side * armX}
            cy={top + 4 + torso * 0.8 + 4}
            r={armWidth * 0.55}
            fill={skin}
            stroke={skinLine}
            strokeWidth={0.8}
            strokeOpacity={0.5}
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
        strokeWidth={0.8}
        strokeOpacity={0.6}
      />
      <Neckline skin={skin} />
      <Collar />
    </>
  );
}
