import { Link, useRouterState } from "@tanstack/react-router";
import { Wrench, ChevronRight, Circle, Home, Calendar, Search, Shield, Bell } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TopControls } from "./TopControls";
import { NotificationHub } from "./NotificationHub";
import { cn } from "@/lib/utils";
import { AppConfig } from "@/app.config";

export function NavBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  const isAdmin = path.startsWith("/admin");

  const NAV_LINKS = [
    { to: "/", label: "Studio", icon: Home, hideIfAdmin: false },
    { to: "/book", label: t("nav.book"), icon: Calendar, hideIfAdmin: true },
    { to: "/track", label: t("nav.track"), icon: Search, hideIfAdmin: true },
    { to: "/admin", label: t("nav.admin"), icon: Shield, hideIfAdmin: false },
  ];

  return (
    <>
      {/* Top Bar (Universal but simplified on mobile) */}
      <div className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto h-12 md:h-14 pl-2 md:pl-6 pr-1 md:pr-3 rounded-full border bg-background/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-between md:justify-start gap-3 md:gap-8 group/nav transition-all hover:bg-background/90 border-border/40 w-full max-w-5xl">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group/logo">
            <div className="relative h-7 w-7 md:h-9 md:h-9 rounded-full bg-primary flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20 transition-transform group-hover/logo:scale-110">
              <Wrench className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground relative z-10 transition-transform group-hover/logo:rotate-45" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-tighter leading-none">{AppConfig.brand.name}</span>
              <div className="hidden md:flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Workshop Active</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-4 w-px bg-border/60" />
            <nav className="flex items-center gap-0.5 md:gap-1.5">
              {NAV_LINKS.filter(l => !(l.hideIfAdmin && isAdmin)).map((link) => {
                const active = path === link.to || (link.to !== "/" && path.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "relative px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all rounded-full",
                      active 
                        ? "text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active && (
                      <div className="absolute inset-0 -z-10 rounded-full bg-primary shadow-lg shadow-primary/30 anim-in zoom-in" />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Controls (Theme Toggle always, Language hidden on mobile) */}
          <div className="flex items-center gap-2">
            <NotificationHub />
            <div className="hidden md:block h-4 w-px bg-border/60 mx-1" />
            <TopControls />
          </div>
        </header>
      </div>

      {/* 2026 Mobile Bottom Nav */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 md:hidden pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-around gap-2 px-6 py-3 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-[400px]">
          {NAV_LINKS.filter(l => !(l.hideIfAdmin && isAdmin)).map((link) => {
            const active = path === link.to || (link.to !== "/" && path.startsWith(link.to));
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative p-3 rounded-2xl transition-all duration-300 group",
                  active ? "text-primary scale-110" : "text-muted-foreground"
                )}
              >
                {active && (
                  <>
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-md anim-in fade-in" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                  </>
                )}
                <Icon className={cn("h-6 w-6 relative z-10 transition-transform", active && "animate-bounce-subtle")} />
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

