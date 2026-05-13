import { Link, useRouterState } from "@tanstack/react-router";
import { Wrench, ChevronRight, Circle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TopControls } from "./TopControls";
import { cn } from "@/lib/utils";
import { AppConfig } from "@/app.config";

export function NavBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  const isAdmin = path.startsWith("/admin");

  const NAV_LINKS = [
    { to: "/", label: "Studio", hideIfAdmin: false },
    { to: "/book", label: t("nav.book"), hideIfAdmin: true },
    { to: "/track", label: t("nav.track"), hideIfAdmin: true },
    { to: "/admin", label: t("nav.admin"), hideIfAdmin: false },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto h-12 md:h-14 pl-1.5 md:pl-6 pr-1 md:pr-3 rounded-full border bg-background/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-1 md:gap-8 group/nav transition-all hover:bg-background/90 border-border/40">
        
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

        {/* Separator */}
        <div className="h-4 w-px bg-border/60 hidden xs:block" />

        {/* Nav Links */}
        <nav className="flex items-center gap-0.5 md:gap-1.5">
          {NAV_LINKS.filter(l => !(l.hideIfAdmin && isAdmin)).map((link) => {
            const active = path === link.to || (link.to !== "/" && path.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative px-2 md:px-4 py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.05em] md:tracking-[0.15em] transition-all rounded-full",
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

        {/* Controls */}
        <div className="flex items-center gap-2 pl-3">
          <div className="h-4 w-px bg-border/60 mr-2" />
          <TopControls />
        </div>
      </header>

      {/* Floating System Status (Right Side) */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden 2xl:flex items-center gap-4">
        <div className="px-5 py-2.5 rounded-2xl bg-background/40 backdrop-blur-md border border-border/40 flex items-center gap-4 anim-in shadow-sm">
          <div className="flex flex-col items-end">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">System Health</div>
            <div className="text-[10px] font-bold">100% Operational</div>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
