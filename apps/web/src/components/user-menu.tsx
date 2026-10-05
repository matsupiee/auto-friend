import { Button } from "@auto-friend/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@auto-friend/ui/components/dropdown-menu";
import { cn } from "@auto-friend/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";

const THEMES = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
  { value: "system", label: "端末の設定に合わせる" },
] as const;

// アカウント情報・表示テーマ・ログアウトをまとめた「その他」メニュー
export default function UserMenu({ withLabel = false }: { withLabel?: boolean }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={withLabel ? "lg" : "icon"}
            className={cn(withLabel && "w-full justify-start gap-4 px-3 font-normal")}
            aria-label="メニュー"
          />
        }
      >
        <Menu className="size-6" strokeWidth={1.75} />
        {withLabel && <span className="text-[15px]">その他</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-semibold text-foreground">
              {session.user.name}
            </span>
            <span className="block truncate">{session.user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>表示テーマ</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value)}>
            {THEMES.map((t) => (
              <DropdownMenuRadioItem key={t.value} value={t.value}>
                {t.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  navigate({ to: "/" });
                },
              },
            });
          }}
        >
          <LogOut />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
