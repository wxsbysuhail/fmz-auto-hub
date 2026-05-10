import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { findByPlate, STATUSES, type Booking, type Status } from "@/lib/store";
import { Search, CheckCircle2, Loader2, Car, ArrowRight, MessageSquare, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import { HoldToSpeak } from "@/components/HoldToSpeak";
import { VehicleMap } from "@/components/VehicleMap";
import { PriceBadge } from "@/components/PriceBadge";
import { useBookings } from "@/lib/store";

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
  const { t } = useI18n();
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
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-24">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary anim-in">
          Live Tracking Active
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">{t("track.title")}</h1>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{t("track.sub")}</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (plate.trim()) lookup(plate.trim()); }}
        className="relative group anim-in"
      >
        <div className="relative flex gap-3 p-2 rounded-[2.5rem] border border-border/40 bg-secondary/5 backdrop-blur-xl focus-within:border-primary/40 focus-within:bg-secondary/10 transition-all duration-500 shadow-2xl shadow-black/5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
            <Input
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder={t("track.placeholder")}
              className="pl-14 h-14 bg-transparent border-none rounded-full uppercase tracking-[0.2em] font-mono text-lg focus-visible:ring-0 placeholder:text-muted-foreground/20"
            />
          </div>
          <div className="flex items-center gap-2 pr-2">
            <HoldToSpeak
              onCapture={(s) => setPlate(s.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              samples={{ en: ["AZ-918-PR", "EV-3-SF"], fr: ["AZ-918-PR", "C-63-AMG"], kr: ["AZ-918-PR", "TYPE-R"] }}
            />
            <Button 
              type="submit" 
              className="h-14 px-8 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50" 
              disabled={!plate.trim() || loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("track.action")}
            </Button>
          </div>
        </div>
        
        {loading && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
            <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[shimmer_1.5s_infinite]" />
            </div>
            Scanning Database...
          </div>
        )}
      </form>

      <div className="mt-10">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {t("track.locating")}</div>
        )}

        {!loading && searched && !booking && (
          <div className="rounded-2xl border bg-card p-8 text-center anim-in">
            <Car className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">{t("track.notfound")}</p>
            <p className="text-sm text-muted-foreground">{t("track.notfound.sub")}</p>
            <Link to="/book" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              {t("nav.book")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {booking && <Tracker booking={booking} />}
      </div>
    </main>
  );
}

function Tracker({ booking }: { booking: Booking }) {
  const { t } = useI18n();
  const { respondToQuote } = useBookings();
  const currentIdx = STATUSES.indexOf(booking.status);
  const isReady = booking.status === "Ready for Pickup";
  
  return (
    <div className="anim-in space-y-12 pb-32">
      {/* Vehicle Command Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-secondary/5 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-background border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                ID: {booking.id}
              </div>
              {booking.isConfirmed ? (
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Booking Confirmed
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 animate-pulse">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Pending FMZ Team Review
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tight leading-tight">{booking.make} {booking.model}</h2>
              <div className="flex items-center gap-3">
                <div className="font-mono text-xl text-primary tracking-[0.2em] font-black">{booking.plate}</div>
                <div className="h-4 w-px bg-border/40" />
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{booking.serviceType}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 shrink-0">
            {booking.quote && (
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Quote</div>
                <PriceBadge amount={booking.quote} label="" className="text-3xl font-black" />
              </div>
            )}
            <Button variant="outline" className="rounded-2xl border-primary/20 text-primary hover:bg-primary/10 px-6 h-12 font-bold uppercase tracking-widest text-[10px]">
              <MessageSquare className="h-4 w-4 mr-2" /> Live Support
            </Button>
          </div>
        </div>

        {!booking.isConfirmed && (
          <div className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-center gap-6 anim-in">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="h-8 w-8 text-amber-500 animate-spin-slow" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="text-sm font-black uppercase tracking-widest text-amber-500">Awaiting FMZ Confirmation</div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Our team is currently reviewing your service request. We will reach out via **WhatsApp or Phone** shortly to finalize your appointment.
              </p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-8 mt-12 pt-12 border-t border-border/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Primary Complaint
            </div>
            <p className="text-lg font-medium leading-relaxed italic text-foreground/80">"{booking.issue || "No description provided."}"</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Scheduled Entrance
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black tracking-tighter">{format(new Date(booking.date), "EEE, MMM d")}</span>
              <span className="text-muted-foreground font-bold text-sm tracking-widest uppercase">{format(new Date(booking.date), "h:mm a")}</span>
            </div>
          </div>
        </div>

        {/* Digital Evidence Vault */}
        {booking.photos && booking.photos.length > 0 && (
          <div className="mt-12 pt-12 border-t border-border/20 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Evidence Vault</div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {booking.photos.map((p, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border/40 group relative shadow-lg">
                  <img src={p} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NEW: Quote Approval Hub */}
      {booking.quoteStatus === "pending" && booking.quoteItems && (
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary/30 bg-primary/5 p-8 sm:p-12 shadow-[0_0_50px_rgba(var(--primary),0.1)] anim-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-10">
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                <Wrench className="h-3 w-3" /> Action Required: Quote Approval
              </div>
              <h3 className="text-3xl font-black tracking-tight">Technical Quote Ready</h3>
              <p className="text-muted-foreground text-sm max-w-md">Our technicians have finalized the diagnostic. Please review the line items below to proceed with the repair.</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Project Cost</div>
              <PriceBadge amount={booking.quote || 0} label="" className="text-4xl font-black" />
            </div>
          </div>

          <div className="space-y-3 mb-10">
            {booking.quoteItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border/40 shadow-sm group hover:border-primary/40 transition-all">
                <div className="font-bold text-foreground/80 group-hover:text-primary transition-colors">{item.description}</div>
                <div className="font-mono font-black text-primary"><PriceBadge amount={item.price} label="" /></div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button 
              onClick={() => respondToQuote(booking.id, "approved")}
              className="w-full sm:w-auto h-14 px-12 rounded-full bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              Approve & Begin Repair
            </Button>
            <Button 
              variant="outline" 
              onClick={() => respondToQuote(booking.id, "rejected")}
              className="w-full sm:w-auto h-14 px-8 rounded-full border-border/40 text-muted-foreground hover:bg-secondary/40 font-bold uppercase tracking-widest text-[10px]"
            >
              Request Revision
            </Button>
          </div>
        </div>
      )}

      {/* Quote Accepted Notification */}
      {booking.quoteStatus === "approved" && (
        <div className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 p-6 flex items-center justify-center gap-4 anim-in">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Quote Approved — Technicians Notified</div>
        </div>
      )}

      {/* NEW: Digital Delivery Certificate (Invoice) */}
      {booking.status === "Ready for Pickup" && (
        <div className="relative overflow-hidden rounded-[3rem] bg-foreground text-background p-10 sm:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.3)] anim-in">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
            <CheckCircle2 className="h-48 w-48" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/40">
                <CheckCircle2 className="h-3.5 w-3.5" /> Operations 100% Complete
              </div>
              <h3 className="text-5xl font-black tracking-tighter leading-none">Ready for Delivery.</h3>
              <p className="text-muted-foreground/80 text-lg max-w-md font-medium leading-relaxed">
                Your vehicle has passed all technical checkpoints and is now ready for collection at the FMZ Auto Studio.
              </p>
              
              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Final Service Summary</div>
                <div className="space-y-2">
                  {booking.quoteItems?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="opacity-60">{item.description}</span>
                      <span className="font-mono font-bold">Rs {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Settlement</span>
                    <span className="text-3xl font-black tracking-tighter text-emerald-400">Rs {(booking.quote || 0 * 1.15).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-4">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Pick-up Location</div>
                <div className="font-bold text-lg">FMZ Auto Studio — Main Bay</div>
                <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Open until 6:00 PM Today</div>
              </div>
              <Button className="h-16 rounded-full bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95">
                Navigate to Studio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Neural Timeline */}
      <div className="px-6 space-y-8">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
          Repair Trajectory
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
        </div>

        <ol className="relative space-y-0">
          {STATUSES.map((s, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <li key={s} className="relative flex gap-10 pb-16 last:pb-0 group">
                {idx < STATUSES.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[19px] top-10 bottom-0 w-1 rounded-full transition-all duration-700",
                      done ? "bg-primary" : "bg-border/20"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 grid h-10 w-10 place-items-center rounded-2xl border-2 bg-background shrink-0 transition-all duration-500 shadow-xl",
                    done && "border-primary bg-primary text-primary-foreground rotate-12",
                    active && "border-primary ring-8 ring-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.3)] animate-bounce-subtle"
                  )}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : (
                    <div className={cn(
                      "h-3 w-3 rounded-full transition-all duration-500", 
                      active ? "bg-primary scale-110 shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-border/40"
                    )} />
                  )}
                </div>
                <div className="pt-1 flex-1">
                  <div className={cn(
                    "text-xl font-black tracking-tight transition-all duration-500", 
                    !done && !active && "text-muted-foreground/30", 
                    active && "text-primary scale-105 origin-left"
                  )}>
                    {s}
                  </div>
                  {active && (
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <div className="text-[10px] text-primary font-black uppercase tracking-widest">
                        System Active: Processing {s}
                      </div>
                    </div>
                  )}
                  {done && (
                    <div className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-1">
                      Stage Finalized
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {isReady && !booking.isPaid && booking.quote && (
        <div className="rounded-[2.5rem] border-2 border-emerald-500/20 bg-emerald-500/5 p-12 text-center anim-in shadow-2xl shadow-emerald-500/10">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">Operations Complete</h2>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed mb-8">
            Your vehicle has cleared all diagnostic and repair stages. Please proceed to the counter for pickup.
          </p>
          <Button className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">
            Generate Final Invoice
          </Button>
        </div>
      )}
      {/* Professional Environment Credit */}
      <div className="mt-32 pt-12 pb-8 border-t border-border/10 flex flex-col items-center gap-4 anim-in">
        <div className="px-4 py-1.5 rounded-full bg-secondary/30 backdrop-blur-xl border border-border/40 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">High-Fidelity Prototype Environment</span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center leading-relaxed">
          Engineered by <span className="text-foreground/60">Suhail Wohedally</span><br />
          AI Product Engineer · FMZ Auto Studio
        </div>
        <div className="mt-4 font-mono text-[8px] opacity-20 tracking-tighter uppercase">Build 1.0.26_X · Stable Production Branch</div>
      </div>
    </div>
  );
}

export type { Status };
