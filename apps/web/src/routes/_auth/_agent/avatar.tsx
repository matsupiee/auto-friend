import type { Avatar } from "@auto-friend/avatar/avatar-schema";
import { Button } from "@auto-friend/ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageContainer } from "@/components/app-shell";
import { AvatarEditor } from "@/components/avatar/avatar-editor";
import Loader from "@/components/loader";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/_agent/avatar")({
  component: AvatarPage,
});

function AvatarPage() {
  const mine = useQuery(trpc.agent.getMine.queryOptions());
  if (!mine.data) return <Loader />;
  return <AvatarForm agentId={mine.data.id} gender={mine.data.gender} initial={mine.data.avatar} />;
}

function AvatarForm({
  agentId,
  gender,
  initial,
}: {
  agentId: string;
  gender: "male" | "female" | "other";
  initial: Avatar;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState(initial);
  const changed = JSON.stringify(avatar) !== JSON.stringify(initial);

  const save = useMutation(
    trpc.agent.updateAvatar.mutationOptions({
      onSuccess: async () => {
        // アイコンはホーム・関係・出来事のすべてに出るので、まとめて読み直す
        await queryClient.invalidateQueries();
        toast.success("見た目を保存しました");
        await navigate({ to: "/agents/$agentId", params: { agentId } });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <PageContainer className="max-w-[560px]">
      <div className="px-4 pt-5 pb-1">
        <h1 className="text-2xl font-bold tracking-tight">見た目を編集</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          パーツを選んで組み合わせ、位置や大きさを整えましょう。見た目を変えても、関係や性格は変わりません。
        </p>
      </div>
      <AvatarEditor
        value={avatar}
        onChange={setAvatar}
        gender={gender}
        stickyClassName="top-14 md:top-0"
      />
      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] flex gap-2 border-t bg-background/95 px-4 pt-3 pb-3 backdrop-blur-xl md:bottom-0">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={!changed}
          onClick={() => setAvatar(initial)}
        >
          元に戻す
        </Button>
        <Button
          size="lg"
          className="flex-[2]"
          disabled={!changed || save.isPending}
          onClick={() => save.mutate({ avatar })}
        >
          {save.isPending ? "保存しています..." : "この見た目で保存"}
        </Button>
      </div>
    </PageContainer>
  );
}
