import type { Avatar } from "@auto-friend/avatar/avatar-schema";
import { generateAvatarFromSeed } from "@auto-friend/avatar/generate-avatar-from-seed";
import type { Gender } from "@auto-friend/db/constants/agent-parameters";

// 画面に出すアバターを決める。まだ作っていないエージェントは、id から毎回同じ見た目を作って返す。
// どの API でも同じ見た目になるよう、エージェントのアバターを返すときは必ずこれを通す。
export function resolveAvatar(agent: {
  id: string;
  gender: Gender;
  avatar: Avatar | null;
}): Avatar {
  return agent.avatar ?? generateAvatarFromSeed(agent.id, agent.gender);
}
