import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { findByPlate, STATUSES, type Booking, type Status } from "@/lib/store";
import { Search, CheckCircle2, Loader2, Car, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const searchSchema = z.object({ plate: z.string().optional() });

export const Route = createFileRoute("/track")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Track Repair — FMZ Auto" },
      { name: "description", content: "Live status of your vehicle's repair." },
    ],
  }),
  component: Track,
});

function Track() {
  const { plate: initialPlate } = Route.useSearch();
  const [plate, setPlate] = useState(initialPlate ?? "");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | undefined>();

  const lookup = async (p: string) => {
    setLoading(true);
    setSearched(false);
    await new Promise((r) => setTimeout(r, 500));
    setBooking(findByPlate(p));
    setSearched(true);
    setLoading(false);
  };

  useEffect(() => {
    if (initialPlate) lookup(initialPlate);
  }, [initialPlate]);

  // Re-poll booking on store updates
  useEffect(() => {
    if (!booking) return;
    const handler = () => {
      const b = findByPlate(booking.plate);
      if (b) setBooking(b);
    };
    window.addEventListener("fmz:bookings-updated", handler);
    return () => window.removeEventListener("fmz:bookings-updated", handler);
  }, [booking?.plate]);

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Track your repair</h1>
      <p className="mt-2 text-muted-foreground">Enter your license plate to see live status.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); if (plate.trim()) lookup(plate.trim()); }}
        className="mt-6 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="e.g. AZ-918-PR"
            className="pl-10 h-12 rounded-full uppercase tracking-wider font-mono"
          />
        </div>
        <Button type="submit" className="h-12 rounded-full px-6 bg-foreground text-background hover:bg-foreground/90" disabled={!plate.trim() || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
        </Button>
      </form>

      <div className="mt-10">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Locating your vehicle…</div>
        )}

        {!loading && searched && !booking && (
          <div className="rounded-2xl border bg-card p-8 text-center anim-in">
            <Car className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No vehicle found</p>
            <p className="text-sm text-muted-foreground">Double-check the plate, or book a new service.</p>
            <Link to="/book" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Book a service <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {booking && <Tracker booking={booking} />}
      </div>
    </main>
  );
}

function Tracker({ booking }: { booking: Booking }) {
  const currentIdx = STATUSES.indexOf(booking.status);
  return (
    <div className="anim-in">
      <div className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{booking.id}</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{booking.make} {booking.model}</h2>
            <div className="mt-1 font-mono text-sm text-muted-foreground">{booking.plate}</div>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            {booking.serviceType}
          </span>
        </div>

        <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Reported issue</div>
          <p className="mt-1">{booking.issue}</p>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Booked for {format(new Date(booking.date), "EEE, MMM d • h:mm a")}
        </div>
      </div>

      <ol className="mt-8 relative">
        {STATUSES.map((s, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
              {idx < STATUSES.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 bottom-0 w-px",
                    done ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div
                className={cn(
                  "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 bg-background shrink-0",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary anim-pulse-dot"
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : (
                  <span className={cn("h-2 w-2 rounded-full", active ? "bg-primary" : "bg-border")} />
                )}
              </div>
              <div className="pt-1">
                <div className={cn("text-sm font-medium", !done && !active && "text-muted-foreground")}>
                  {s}
                </div>
                {active && <div className="text-xs text-primary mt-0.5">In progress now</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export type { Status };
