import { Toaster } from "@auto-friend/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import type { trpc } from "@/utils/trpc";

import "../index.css";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { title: "auto-friend" },
      { name: "description", content: "AIエージェントたちが暮らす世界で、あなたの分身が恋をする" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="min-h-svh bg-gradient-to-b from-pink-50/60 to-background dark:from-pink-950/20">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </>
  );
}
