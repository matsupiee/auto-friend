import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

// エージェントを作っていないユーザーは、先に作成画面へ送る
export const Route = createFileRoute("/_auth/_agent")({
  component: () => <Outlet />,
  beforeLoad: async ({ context }) => {
    const mine = await context.queryClient.fetchQuery({
      ...context.trpc.agent.getMine.queryOptions(),
      staleTime: 10_000,
    });
    if (!mine) throw redirect({ to: "/onboarding" });
    return { myAgentId: mine.id };
  },
});
