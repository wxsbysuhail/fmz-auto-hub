import { Link, useRouterState } from "@tanstack/react-router";
import { Wrench, ChevronRight, Circle, Home, Calendar, Search, Shield, Bell, Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { TopControls } from "./TopControls";
import { NotificationHub } from "./NotificationHub";
import { cn } from "@/lib/utils";
import { AppConfig } from "@/app.config";

export function NavBar() {
  const { theme, setTheme } = useTheme();
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
      {/* 2026 Desktop Nav (Neural Glass) */}
      <div className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto h-14 pl-2 pr-2 rounded-full border bg-background/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-6 group/nav transition-all hover:bg-background/80 border-border/40 max-w-fit">
          
          {/* Brand Badge */}
          <Link to="/" className="flex items-center gap-3 pl-4 pr-6 border-r border-border/20 group/logo">
            <div className="relative h-9 w-9 rounded-full bg-primary flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20 transition-transform group-hover/logo:scale-110">
              <Wrench className="h-4 w-4 text-primary-foreground relative z-10 transition-transform group-hover/logo:rotate-45" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-tighter leading-none">{AppConfig.brand.name}</span>
              <span className="text-[7px] font-bold text-green-500 uppercase tracking-[0.2em] mt-0.5 animate-pulse">Live OS</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-1.5">
            {NAV_LINKS.filter(l => !(l.hideIfAdmin && isAdmin)).map((link) => {
              const active = path === link.to || (link.to !== "/" && path.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "relative px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all rounded-full group/link",
                    active 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <div className="absolute inset-0 -z-10 rounded-full bg-primary shadow-[0_0_20px_var(--color-primary)] opacity-90 anim-in zoom-in" />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Contextual Controls */}
          <div className="flex items-center gap-2 pl-4 pr-2 border-l border-border/20 ml-2">
            {isAdmin && <NotificationHub />}
            <TopControls />
          </div>
        </header>
      </div>

      {/* 2026 Mobile Dynamic Island Pill */}
      <div className="fixed top-6 left-0 right-0 z-50 flex md:hidden justify-center px-6 pointer-events-none">
        <div className="pointer-events-auto h-11 px-4 rounded-full bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 anim-in slide-in-from-top-4 min-w-[220px]">
          
          {/* Column 1: Brand Logo & Theme Toggle */}
          <div className="flex-1 flex justify-start items-center gap-3">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-3 w-3 text-yellow-400" />
              ) : (
                <Moon className="h-3 w-3 text-blue-400" />
              )}
            </button>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Wrench className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>

          {/* Column 2: Center Text */}
          <div className="flex-[2] flex justify-center whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white leading-none">{AppConfig.brand.name}</span>
          </div>

          {/* Column 3: Contextual Action/Status */}
          <div className="flex-1 flex justify-end">
            {isAdmin ? (
              <NotificationHub />
            ) : (
              <div className="relative flex h-2 w-2 mr-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              </div>
            )}
          </div>

          {/* Liquid Reflection Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 2026 Mobile Bottom Nav */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-8 md:hidden pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-around gap-2 px-6 py-4 rounded-[2.5rem] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.6)] w-full max-w-[360px]">
          {NAV_LINKS.filter(l => !(l.hideIfAdmin && isAdmin)).map((link) => {
            const active = path === link.to || (link.to !== "/" && path.startsWith(link.to));
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative p-3 rounded-2xl transition-all duration-300 group",
                  active ? "text-primary scale-110" : "text-white/40 hover:text-white/60"
                )}
              >
                {active && (
                  <>
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl anim-in fade-in" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
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

