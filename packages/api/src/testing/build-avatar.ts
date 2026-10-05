import type { Avatar } from "@auto-friend/avatar/avatar-schema";

// テストで使うアバターの例。テストごとに一部だけ上書きして使う。
export function buildAvatar(): Avatar {
  return {
    face: { shape: "round", skinColor: "natural", cheek: "none" },
    hair: { style: "short", color: "black", flip: false },
    eyebrow: { style: "natural", color: "black", y: 0, size: 0, rotation: 0, spacing: 0 },
    eye: { style: "round", color: "black", y: 0, size: 0, rotation: 0, spacing: 0 },
    nose: { style: "dot", y: 0, size: 0 },
    mouth: { style: "smile", color: "natural", y: 0, size: 0 },
    facialHair: { mustache: "none", beard: "none", color: "black" },
    glasses: { style: "none", color: "black", size: 0 },
    mole: { visible: false, x: 0, y: 0 },
    body: { height: 50, build: 50 },
    favoriteColor: "blue",
  };
}
