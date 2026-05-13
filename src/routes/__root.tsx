import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Wrench } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { TopControls } from "@/components/TopControls";
import { NavBar } from "@/components/NavBar";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold tracking-tight">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2 text-sm text-background">
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-foreground px-5 py-2 text-sm text-background"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

import { AppConfig } from "@/app.config";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        title: AppConfig.seo.title,
      },
      {
        name: "description",
        content: AppConfig.seo.description,
      },
      {
        property: "og:title",
        content: AppConfig.seo.ogTitle,
      },
      {
        property: "og:description",
        content: AppConfig.seo.ogDescription,
      },
      {
        property: "og:image",
        content: AppConfig.seo.ogImage,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "theme-color",
        content: AppConfig.seo.themeColor,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <NavBar />
            <main className="pt-24 pb-64">
              <Outlet />
            </main>
            <Toaster position="top-center" />
            
            <Toaster position="top-center" />
            
            {/* 2026 Floating Signature Pill */}
            <div className="fixed bottom-24 md:bottom-8 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
              <div className="pointer-events-auto flex flex-col items-center gap-1 scale-90 md:scale-100">
                <div className="glass-premium flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl animate-in slide-in-from-bottom-4 duration-1000">
                  <div className="relative flex items-center gap-2 pr-4 border-r border-white/10">
                    <div className="relative flex h-2 w-2">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></div>
                      <div className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_var(--color-primary)]"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/90">Visual Prototype</span>
                  </div>
                  <div className="flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">Designed & Engineered by</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">{AppConfig.brand.engineeredBy}</span>
                  </div>
                </div>
                {/* Visual Depth Glow */}
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
              </div>
            </div>
          </div>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

