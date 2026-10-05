import { buttonVariants } from "@auto-friend/ui/components/button";
import { cn } from "@auto-friend/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, House, type LucideIcon, Users } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

import { AgentAvatar } from "./agent-avatar";
import UserMenu from "./user-menu";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("brand-text text-[22px] font-extrabold tracking-[-0.04em]", className)}
    >
      auto-friend
    </Link>
  );
}

type NavItem = {
  to: "/home" | "/relationships";
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/home", label: "ホーム", icon: House },
  { to: "/relationships", label: "関係", icon: Users },
];

// ログイン後はスマホで「上部バー + 下部タブ」、PC で「左サイドバー」になる、SNS アプリ風のレイアウト
export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mine = useQuery({ ...trpc.agent.getMine.queryOptions(), enabled: !!session });
  const me = session ? mine.data : null;
  const showNav = !!me && pathname !== "/" && pathname !== "/login";

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const profilePath = me ? `/agents/${me.id}` : "";

  return (
    <div className="min-h-svh bg-background">
      {showNav && me && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col border-r px-3 pt-8 pb-5 md:flex xl:w-60">
          <div className="mb-8 px-3">
            <Logo className="hidden xl:inline" />
            <Link to="/" aria-label="auto-friend" className="xl:hidden">
              <Heart className="size-6 fill-brand text-brand" />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "justify-start gap-4 px-3 font-normal",
                  isActive(to) && "font-bold",
                )}
              >
                <Icon className="size-6" strokeWidth={isActive(to) ? 2.5 : 1.75} />
                <span className="hidden text-[15px] xl:inline">{label}</span>
              </Link>
            ))}
            <Link
              to="/agents/$agentId"
              params={{ agentId: me.id }}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start gap-4 px-3 font-normal",
                pathname === profilePath && "font-bold",
              )}
            >
              <AgentAvatar
                id={me.id}
                avatar={me.avatar}
                size="xs"
                className={cn(
                  "-mx-0.5 rounded-full",
                  pathname === profilePath && "ring-2 ring-foreground ring-offset-1",
                )}
              />
              <span className="hidden text-[15px] xl:inline">プロフィール</span>
            </Link>
          </nav>
          <UserMenu withLabel />
        </aside>
      )}

      <header
        className={cn(
          "sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl",
          showNav && "md:hidden",
          // ログイン画面はフォーム側にロゴがあるので、上部バーを出さない
          pathname === "/login" && "hidden",
        )}
      >
        <div className="mx-auto flex h-14 max-w-[630px] items-center justify-between gap-2 px-4">
          <Logo />
          <div className="flex items-center gap-1">
            {session ? (
              <UserMenu />
            ) : (
              pathname !== "/login" && (
                <Link to="/login" className={buttonVariants({ size: "sm" })}>
                  ログイン
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      <div
        className={cn(
          showNav && "pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-[72px] xl:pl-60",
        )}
      >
        {children}
      </div>

      {showNav && me && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex h-14 max-w-[630px] items-center justify-around">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex size-12 items-center justify-center rounded-lg active:bg-muted"
              >
                <Icon className="size-[26px]" strokeWidth={isActive(to) ? 2.5 : 1.75} />
                <span className="sr-only">{label}</span>
              </Link>
            ))}
            <Link
              to="/agents/$agentId"
              params={{ agentId: me.id }}
              className="flex size-12 items-center justify-center rounded-lg active:bg-muted"
            >
              <AgentAvatar
                id={me.id}
                avatar={me.avatar}
                size="xs"
                className={cn(
                  "rounded-full",
                  pathname === profilePath &&
                    "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
              />
              <span className="sr-only">プロフィール</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

// ページ本体の共通コンテナ。SNS のタイムラインと同じく中央寄せの細いカラムにする。
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <main className={cn("mx-auto w-full max-w-[630px] pb-10", className)}>{children}</main>;
}
