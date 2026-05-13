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
            
            {/* Architect Signature & Prototype Notice */}
            <footer className="mt-auto py-12 flex justify-center px-4 w-full">
              <div className="glass flex flex-col md:flex-row items-center gap-2 md:gap-3 rounded-2xl md:rounded-full border border-white/10 px-3 md:px-4 py-1.5 md:py-2 text-[8px] md:text-[10px] font-medium tracking-widest uppercase text-muted-foreground shadow-2xl backdrop-blur-xl animate-in text-center md:text-left">
                <div className="flex items-center gap-1.5 md:border-r border-white/10 md:pr-3">
                  <div className="h-1 w-1 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                  <span>Visual Prototype</span>
                </div>
                <div className="flex items-center gap-1 opacity-80">
                  <span className="font-mono text-[7px] md:text-[9px] opacity-50 hidden xs:inline">DESIGNED & ENGINEERED BY</span>
                  <span className="text-foreground">{AppConfig.brand.engineeredBy}</span>
                </div>
              </div>
            </footer>
          </div>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

