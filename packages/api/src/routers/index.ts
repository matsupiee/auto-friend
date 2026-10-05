import { publicProcedure, router } from "../index";
import { agentCreateRoute } from "./consumer/agent/create/route";
import { agentGetRoute } from "./consumer/agent/get/route";
import { agentGetMineRoute } from "./consumer/agent/get-mine/route";
import { agentGetOnboardingOptionsRoute } from "./consumer/agent/get-onboarding-options/route";
import { agentUpdateAvatarRoute } from "./consumer/agent/update-avatar/route";
import { feedGetDayRoute } from "./consumer/feed/get-day/route";
import { relationshipListRoute } from "./consumer/relationship/list/route";
import { worldAdvanceDayRoute } from "./consumer/world/advance-day/route";
import { worldGetStatusRoute } from "./consumer/world/get-status/route";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  agent: router({
    getOnboardingOptions: agentGetOnboardingOptionsRoute,
    create: agentCreateRoute,
    getMine: agentGetMineRoute,
    get: agentGetRoute,
    updateAvatar: agentUpdateAvatarRoute,
  }),
  relationship: router({
    list: relationshipListRoute,
  }),
  feed: router({
    getDay: feedGetDayRoute,
  }),
  world: router({
    getStatus: worldGetStatusRoute,
    advanceDay: worldAdvanceDayRoute,
  }),
});
export type AppRouter = typeof appRouter;
