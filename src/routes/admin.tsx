import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBookings, STATUSES, type Booking, type Status, isClosedDay } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Wrench, Car, Calendar as CalIcon, TrendingUp, ChevronLeft, ChevronRight, MessageCircle, QrCode, Printer } from "lucide-react";
import { format, isSameDay, isSameMonth, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — FMZ Auto" },
      { name: "description", content: "Manage bookings, repairs, and shop workload." },
    ],
  }),
  component: Admin,
});

const KANBAN_COLUMNS: { id: Status; label: string }[] = [
  { id: "Booking Confirmed", label: "Incoming Today" },
  { id: "Vehicle in Garage", label: "In Garage" },
  { id: "Diagnosing", label: "Standby / Diagnosing" },
  { id: "Waiting on Parts", label: "Waiting on Parts" },
  { id: "In Repair", label: "In Repair" },
  { id: "Ready for Pickup", label: "Ready" },
];

function Admin() {
  const { bookings, updateStatus } = useBookings();
  const [selected, setSelected] = useState<Booking | null>(null);

  const todayBookings = bookings.filter((b) => isSameDay(new Date(b.date), new Date())).length;
  const inGarage = bookings.filter((b) => !["Booking Confirmed", "Ready for Pickup"].includes(b.status)).length;
  const monthly = bookings.filter((b) => isSameMonth(new Date(b.date), new Date())).length;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Workshop</h1>
          <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
      </div>

      {/* Stat cards + QR kiosk */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Stat icon={CalIcon} label="Today's bookings" value={todayBookings} hint="confirmed for today" />
        <Stat icon={Car} label="Cars in garage" value={inGarage} hint="active jobs" accent />
        <Stat icon={TrendingUp} label="Monthly volume" value={monthly} hint={format(new Date(), "MMMM")} />
        <QrKioskCard />
      </div>

      <Tabs defaultValue="kanban">
        <TabsList className="rounded-full bg-secondary p-1">
          <TabsTrigger value="kanban" className="rounded-full px-4">Kanban</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full px-4">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <Kanban bookings={bookings} onSelect={setSelected} onMove={(b, s) => {
            updateStatus(b.id, s);
            toast.success(`${b.make} ${b.model} → ${s}`);
          }} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView bookings={bookings} onSelect={setSelected} />
        </TabsContent>
      </Tabs>

      <RepairModal
        booking={selected}
        onClose={() => setSelected(null)}
        onUpdate={(s) => {
          if (selected) {
            updateStatus(selected.id, s);
            toast.success("Status updated", { description: `${selected.make} ${selected.model} is now ${s}.` });
            setSelected({ ...selected, status: s });
          }
        }}
      />
    </main>
  );
}

function Stat({ icon: Icon, label, value, hint, accent }: any) {
  return (
    <div className={cn(
      "rounded-2xl border p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]",
      accent ? "bg-foreground text-background border-foreground" : "bg-card"
    )}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs uppercase tracking-wider", accent ? "text-background/60" : "text-muted-foreground")}>{label}</span>
        <Icon className="h-4 w-4 opacity-60" />
      </div>
      <div className="mt-3 text-4xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className={cn("mt-1 text-xs", accent ? "text-background/60" : "text-muted-foreground")}>{hint}</div>
    </div>
  );
}

function Kanban({ bookings, onSelect, onMove }: {
  bookings: Booking[];
  onSelect: (b: Booking) => void;
  onMove: (b: Booking, s: Status) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
      <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 min-w-full">
        {KANBAN_COLUMNS.map((col) => {
          const items = bookings.filter((b) => b.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  const b = bookings.find((x) => x.id === dragId);
                  if (b && b.status !== col.id) onMove(b, col.id);
                  setDragId(null);
                }
              }}
              className="rounded-2xl bg-secondary/60 p-3"
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <div className="text-xs font-semibold uppercase tracking-wider">{col.label}</div>
                <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {items.map((b) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => setDragId(b.id)}
                    className="group rounded-xl border bg-card p-3 transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
                  >
                    <button onClick={() => onSelect(b)} className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium truncate">{b.clientName}</div>
                        <span className="text-[10px] font-mono text-muted-foreground">{b.id}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{b.make} {b.model}</div>
                      <div className="mt-2 inline-block rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px]">{b.plate}</div>
                      <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{b.issue}</div>
                    </button>
                    <WhatsAppButton booking={b} />
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView({ bookings, onSelect }: { bookings: Booking[]; onSelect: (b: Booking) => void }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [pickedDay, setPickedDay] = useState<Date | undefined>(new Date());

  const dayBookings = useMemo(
    () => (pickedDay ? bookings.filter((b) => isSameDay(new Date(b.date), pickedDay)) : []),
    [bookings, pickedDay]
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      const k = format(new Date(b.date), "yyyy-MM-dd");
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return map;
  }, [bookings]);

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="font-semibold">{format(month, "MMMM yyyy")}</div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={pickedDay}
          onSelect={setPickedDay}
          modifiers={{ closed: (d) => isClosedDay(d) }}
          modifiersClassNames={{ closed: "opacity-30 line-through" }}
          components={{
            DayButton: ({ day, modifiers, ...p }: any) => {
              const c = counts.get(format(day.date, "yyyy-MM-dd")) ?? 0;
              return (
                <button {...p} className={cn(p.className, "relative")}>
                  {day.date.getDate()}
                  {c > 0 && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            },
          }}
          className="p-2 pointer-events-auto"
        />
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{pickedDay ? format(pickedDay, "EEEE, MMMM d") : "Select a day"}</h3>
          <span className="text-xs text-muted-foreground">{dayBookings.length} booking{dayBookings.length !== 1 && "s"}</span>
        </div>
        <div className="space-y-2">
          {dayBookings.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No bookings on this day.
            </div>
          )}
          {dayBookings.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className="w-full text-left rounded-xl border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{b.clientName} — {b.make} {b.model}</div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{b.status}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{b.serviceType} • <span className="font-mono">{b.plate}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RepairModal({ booking, onClose, onUpdate }: {
  booking: Booking | null;
  onClose: () => void;
  onUpdate: (s: Status) => void;
}) {
  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        {booking && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <DialogTitle className="text-xl">{booking.make} {booking.model}</DialogTitle>
                  <DialogDescription className="font-mono">{booking.plate} · {booking.id}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Client" value={booking.clientName} />
                <Info label="Service" value={booking.serviceType} />
                <Info label="Booked for" value={format(new Date(booking.date), "MMM d, h:mm a")} />
                <Info label="Phone" value={booking.phone || "—"} />
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Issue</div>
                <p className="mt-1 text-sm">{booking.issue}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Status</div>
                <Select value={booking.status} onValueChange={(v) => onUpdate(v as Status)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} className="rounded-full">Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
