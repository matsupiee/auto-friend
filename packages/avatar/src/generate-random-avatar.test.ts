import { describe, expect, test } from "bun:test";

import { avatarSchema } from "./avatar-schema";
import { generateAvatarFromSeed } from "./generate-avatar-from-seed";
import { generateRandomAvatar } from "./generate-random-avatar";

describe("generateRandomAvatar", () => {
  test("どの性別でも、保存できる正しい組み合わせを作る", () => {
    for (const gender of ["male", "female", "other"] as const) {
      for (let i = 0; i < 200; i++) {
        expect(avatarSchema.safeParse(generateRandomAvatar(Math.random, gender)).success).toBe(
          true,
        );
      }
    }
  });

  test("女性ではヒゲが生えない", () => {
    for (let i = 0; i < 200; i++) {
      const avatar = generateRandomAvatar(Math.random, "female");
      expect(avatar.facialHair.mustache).toBe("none");
      expect(avatar.facialHair.beard).toBe("none");
    }
  });
});

describe("generateAvatarFromSeed", () => {
  test("同じ文字列からは同じアバター、違う文字列からは違うアバターができる", () => {
    expect(generateAvatarFromSeed("agent-1", "male")).toEqual(
      generateAvatarFromSeed("agent-1", "male"),
    );
    expect(generateAvatarFromSeed("agent-1", "male")).not.toEqual(
      generateAvatarFromSeed("agent-2", "male"),
    );
  });
});
