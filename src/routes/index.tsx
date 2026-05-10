import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Activity, LayoutDashboard, ShieldCheck, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FMZ Auto — Book, Track, Manage" },
      { name: "description", content: "A premium, minimalist platform for booking auto service and tracking repairs in real time." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.97_0.02_27)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground anim-in">
            <Sparkles className="h-3 w-3" /> Workshop OS — 2026 Edition
          </div>
          <h1 className="mt-6 text-balance text-5xl sm:text-7xl font-semibold tracking-tight anim-in">
            The workshop, <span className="text-primary">refined.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground anim-in">
            FMZ Auto brings the studio-grade simplicity of Apple to auto service. Book in seconds, track in real time, manage with calm clarity.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 anim-in">
            <Link
              to="/book"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            >
              Book a service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/track"
              className="rounded-full border bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
            >
              Track my car
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 pb-24 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Calendar, title: "Frictionless booking", body: "A three-step intake. Smart calendar, never a Wednesday or Sunday." },
          { icon: Activity, title: "Live status timeline", body: "Your customers watch the repair unfold like a premium delivery." },
          { icon: LayoutDashboard, title: "Calm command center", body: "Kanban, calendar, and one-tap status updates for the whole shop." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Certified mechanics</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Open Mon–Sat (Wed closed)</span>
          </div>
          <span>© {new Date().getFullYear()} FMZ Auto</span>
        </div>
      </section>
    </main>
  );
}
