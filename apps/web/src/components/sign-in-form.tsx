import { Button } from "@auto-friend/ui/components/button";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { AuthField, AuthLayout } from "@/components/auth-layout";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/home",
            });
            toast.success("ログインしました");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("メールアドレスの形式が正しくありません"),
        password: z.string().min(8, "パスワードは8文字以上にしてください"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <AuthLayout
      title="おかえりなさい"
      description="あなたのエージェントの今日を見にいきましょう"
      footer={
        <Button variant="link" onClick={onSwitchToSignUp} className="h-auto p-0">
          アカウントをお持ちでない方はこちら
        </Button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-2"
      >
        <form.Field name="email">
          {(field) => (
            <AuthField field={field} label="メールアドレス" type="email" autoComplete="email" />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <AuthField
              field={field}
              label="パスワード"
              type="password"
              autoComplete="current-password"
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              size="lg"
              className="mt-3 w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "送信中..." : "ログイン"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthLayout>
  );
}
