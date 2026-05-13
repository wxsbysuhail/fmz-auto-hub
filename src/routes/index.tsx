import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Activity, LayoutDashboard, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { AppConfig } from "@/app.config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: AppConfig.seo.title },
      { name: "description", content: AppConfig.seo.description },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* Cinematic Hero Section */}
      <section className="relative pt-4 pb-20 sm:pt-40 sm:pb-56">
        {/* Animated Background Depth */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-primary/5 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            {/* Integrated Visual Prototype Signature */}
            <div className="mt-12 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl shadow-lg anim-in">
              <div className="relative flex items-center gap-2 pr-4 border-r border-primary/10">
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
            
            <h1 className="mt-8 md:mt-10 text-balance text-4xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] md:leading-[0.85] anim-in [animation-delay:200ms]">
              {AppConfig.hero.titleTop} <br />
              <span className="text-glow opacity-90 text-primary">{AppConfig.hero.titleAccent}</span>
            </h1>
            
            <p className="mx-auto mt-6 md:mt-10 max-w-2xl text-balance text-base sm:text-xl md:text-2xl text-muted-foreground/80 font-light leading-relaxed anim-in [animation-delay:400ms]">
              {AppConfig.hero.subtext}
            </p>

            <div className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-4 md:gap-5 anim-in [animation-delay:600ms]">
              <Link
                to="/book"
                className="group relative inline-flex items-center gap-2 md:gap-3 rounded-full bg-foreground px-6 md:px-10 py-3 md:py-5 text-xs md:text-sm font-bold text-background transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-[0_0_40px_rgba(var(--primary),0.3)]"
              >
                {AppConfig.hero.ctaPrimary} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/track"
                className="rounded-full border border-border/40 bg-background/40 backdrop-blur-2xl px-6 md:px-10 py-3 md:py-5 text-xs md:text-sm font-bold transition-all hover:bg-secondary/50 hover:border-border/80"
              >
                {AppConfig.hero.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 md:mt-20 relative anim-in [animation-delay:800ms] group">
            <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-border/40 bg-card shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop" 
                alt="Premium Workshop" 
                className="w-full aspect-video md:aspect-[21/9] object-cover opacity-60 md:opacity-80 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 grid place-items-center z-20 p-4">
                <div className="p-6 md:p-14 rounded-[1.5rem] md:rounded-[2rem] bg-black/20 md:bg-black/10 backdrop-blur-xl border border-white/10 text-center shadow-2xl max-w-sm md:max-w-none">
                  <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4 opacity-60 text-white/80">Engineering Excellence</div>
                  <div className="text-xl md:text-4xl font-light tracking-tight text-white italic leading-tight">
                    "Precision in <br /> every turn."
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Technical Stats */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-20 pointer-events-none">
              <TechnicalBadge label="Diagnostics" value="99.8% Accuracy" />
              <TechnicalBadge label="Team" value="Master Technicians" />
            </div>
            <div className="absolute right-6 bottom-12 hidden xl:flex flex-col gap-4 z-20 pointer-events-none">
              <TechnicalBadge label="Uptime" value="24/7 Monitoring" />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Bento Features */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Calendar, title: "Seamless Intake", body: "A refined three-step booking experience designed for speed and clarity." },
            { icon: Activity, title: "Real-time Mastery", body: "Watch your vehicle's transformation through a high-fidelity live timeline." },
            { icon: LayoutDashboard, title: "Next-Gen Control", body: "The engine that powers your shop. Intuitive, robust, and always in sync." },
          ].map(({ icon: Icon, title, body }, i) => (
            <div 
              key={title} 
              className="group relative rounded-[2rem] border border-border/40 bg-card/50 p-8 transition-all hover:bg-card hover:shadow-2xl hover:-translate-y-1 anim-in"
              style={{ animationDelay: `${1000 + (i * 100)}ms` }}
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Certified mechanics</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Open Mon-Sat (Wed closed)</span>
          </div>
          <span>© {new Date().getFullYear()} FMZ Auto</span>
        </div>
      </section>
    </main>
  );
}

function TechnicalBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/40 backdrop-blur-2xl p-3.5 sm:p-5 shadow-2xl anim-in hover:bg-background/60 transition-colors border-white/5">
      <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{label}</div>
      <div className="mt-1 text-sm font-bold tracking-tight text-foreground">{value}</div>
    </div>
  );
}
