import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const links = [
    { to: "/home", label: "ホーム" },
    { to: "/relationships", label: "関係" },
  ] as const;

  return (
    <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-base font-bold tracking-tight">
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              auto-friend
            </span>
          </Link>
          {session && (
            <nav className="flex gap-3 text-sm">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-muted-foreground hover:text-foreground"
                  activeProps={{ className: "text-foreground font-semibold" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
