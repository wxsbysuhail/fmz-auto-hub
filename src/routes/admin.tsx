import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useBookings, STATUSES, type Booking, type Status, isClosedDay } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wrench, Car, Calendar as CalIcon, TrendingUp, ChevronLeft, ChevronRight, MessageCircle, QrCode, Printer, ShieldAlert, User, DollarSign, Clock, ListChecks, CalendarRange, Filter, Check, Bell, BellRing, Package, AlertCircle, Camera, Star, Plus, Zap, Sparkles } from "lucide-react";
import { format, isSameDay, isSameMonth, startOfMonth, addDays, eachDayOfInterval, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { VehicleMap } from "@/components/VehicleMap";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CreditCard, PieChart as PieChartIcon } from "lucide-react";

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

function Stat({ icon: Icon, label, value, hint, accent }: any) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-[2.5rem] border p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl",
      accent 
        ? "bg-foreground text-background border-foreground/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
        : "bg-background/40 backdrop-blur-xl border-border/40"
    )}>
      {accent && (
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
      )}
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]", 
            accent ? "text-background/50" : "text-muted-foreground/60"
          )}>
            {label}
          </span>
          <div className="text-3xl font-black tracking-tighter leading-none">
            {value}
          </div>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
          accent ? "bg-background/10" : "bg-secondary"
        )}>
          <Icon className={cn("h-5 w-5", accent ? "text-background" : "text-muted-foreground")} />
        </div>
      </div>
      
      <div className={cn(
        "mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest", 
        accent ? "text-background/40" : "text-muted-foreground/40"
      )}>
        <div className={cn("h-1 w-1 rounded-full", accent ? "bg-background/30" : "bg-primary/30")} />
        {hint}
      </div>
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
    <div className="overflow-x-auto modern-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6 pb-6">
      <div className="flex gap-5 min-w-max">
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
              className="w-[280px] flex flex-col rounded-[2rem] bg-secondary/30 border border-border/40 p-4 transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-center justify-between px-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">{col.label}</div>
                </div>
                <span className="text-[10px] font-bold tabular-nums bg-background/50 px-2 py-0.5 rounded-full border">{items.length}</span>
              </div>

              <div className="space-y-3 flex-1 min-h-[300px]">
                {items.map((b) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => setDragId(b.id)}
                    className="group rounded-2xl border bg-card p-4 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden active:scale-95 active:rotate-1"
                  >
                    {!b.isConfirmed && (
                      <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-bl-lg shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                    )}
                    
                    <button onClick={() => onSelect(b)} className="w-full text-left">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">{b.id}</div>
                        <div className="flex items-center gap-1.5">
                          {b.priority && (
                             <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              b.priority === "high" ? "bg-red-500" : b.priority === "medium" ? "bg-orange-500" : "bg-blue-500"
                            )} />
                          )}
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">{b.plate}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm font-bold tracking-tight mb-0.5">{b.clientName}</div>
                      <div className="text-[11px] text-muted-foreground font-medium mb-4">{b.make} {b.model}</div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        {b.quote ? (
                          <div className="text-xs font-black text-primary">${b.quote.toLocaleString()}</div>
                        ) : (
                          <div className="text-[9px] font-bold uppercase tracking-widest opacity-30 italic">No Quote</div>
                        )}
                        {b.technician && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60">
                            <User className="h-3 w-3" />
                            {b.technician.split(" ")[0]}
                          </div>
                        )}
                      </div>
                    </button>
                    
                    <WhatsAppButton 
                      booking={b} 
                      className="mt-4 bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground border-none shadow-none"
                    />
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="flex-1 grid place-items-center h-full min-h-[150px] rounded-2xl border-2 border-dashed border-border/20 group/empty">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 group-hover/empty:text-muted-foreground/40 transition-colors">Empty Slot</div>
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
  const [date, setDate] = useState<Date | undefined>(new Date());

  const dayBookings = bookings.filter(b => 
    format(new Date(b.date), "yyyy-MM-dd") === (date ? format(date, "yyyy-MM-dd") : "")
  );

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 anim-in [animation-delay:400ms]">
      {/* Calendar Node */}
      <div className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-8 hover:shadow-2xl transition-all duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CalIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tighter">Availability Map</h3>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Service Slot Allocation</p>
            </div>
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="p-0 border-none w-full"
          classNames={{
            months: "relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
            month: "space-y-4 w-full flex flex-col items-center",
            table: "w-full border-collapse space-y-1",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-2xl shadow-xl shadow-primary/30",
            day_today: "bg-secondary text-foreground font-black rounded-2xl",
            day: "h-12 w-12 p-0 font-bold aria-selected:opacity-100 hover:bg-secondary/50 rounded-2xl transition-all",
            head_cell: "text-muted-foreground/40 font-black text-[10px] uppercase tracking-[0.2em] pb-4 w-12",
            nav: "absolute left-1/2 -translate-x-1/2 flex items-center justify-between w-[280px] z-10 pt-1",
            button_previous: "hover:bg-secondary rounded-xl transition-colors h-10 w-10 p-0 flex items-center justify-center",
            button_next: "hover:bg-secondary rounded-xl transition-colors h-10 w-10 p-0 flex items-center justify-center",
            caption: "flex justify-center pt-1 relative items-center mb-10 w-full",
            caption_label: "text-sm font-black tracking-[0.3em] uppercase",
          }}
        />
      </div>

      {/* Daily Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black tracking-tighter">
              {date ? format(date, "MMMM d") : "Select a date"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Workshop Capacity: {dayBookings.length}/5 Bays</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-border/40 before:dash-array-[4,4]">
          {dayBookings.length === 0 ? (
            <div className="p-12 text-center bg-secondary/20 rounded-[2rem] border border-dashed border-border/40">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">No Active Appointments</div>
            </div>
          ) : (
            dayBookings.map((b, idx) => (
              <button 
                key={b.id} 
                onClick={() => onSelect(b)} 
                className="w-full group relative pl-16 text-left transition-all hover:-translate-x-1"
              >
                {/* Timeline Node */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-lg shadow-primary/20 z-10 transition-transform group-hover:scale-125" />
                
                <div className="p-5 rounded-[2rem] border border-border/40 bg-background/40 backdrop-blur-xl transition-all group-hover:bg-background/80 group-hover:shadow-xl group-hover:border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] font-black tracking-widest text-primary uppercase">{format(new Date(b.date), "h:mm a")}</div>
                    <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{b.plate}</div>
                  </div>
                  
                  <div className="text-base font-black tracking-tight">{b.clientName}</div>
                  <div className="text-[11px] font-bold text-muted-foreground/60">{b.make} {b.model} · {b.serviceType}</div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    {b.technician ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{b.technician.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Unassigned</div>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PlanningView({ bookings, onSelect }: { bookings: Booking[]; onSelect: (b: Booking) => void }) {
  const [startDate, setStartDate] = useState(new Date());
  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 13)
  });

  const activeBookings = bookings.filter(b => b.isConfirmed && b.status !== "Ready for Pickup");

  return (
    <div className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 overflow-hidden shadow-2xl anim-in [animation-delay:500ms]">
      <div className="p-8 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-secondary/10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CalendarRange className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter">Capacity Planning</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Workshop Load Distribution</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-full border border-border/40">
          <Button variant="ghost" size="sm" onClick={() => setStartDate(d => addDays(d, -7))} className="rounded-full h-10 px-6 font-bold hover:bg-background">
            <ChevronLeft className="h-4 w-4 mr-1" /> Earlier
          </Button>
          <div className="h-4 w-px bg-border/40 mx-2" />
          <Button variant="ghost" size="sm" onClick={() => setStartDate(d => addDays(d, 7))} className="rounded-full h-10 px-6 font-bold hover:bg-background">
            Next Week <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto modern-scrollbar">
        <div className="min-w-[1400px]">
          {/* Header Row */}
          <div className="grid grid-cols-[280px_repeat(14,1fr)] border-b border-border/40 bg-secondary/5 relative">
            <div className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-r border-border/40 bg-background/40 backdrop-blur-md sticky left-0 z-30">Resource / Vehicle</div>
            {days.map(day => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={cn(
                  "p-4 text-center border-r border-border/40 last:border-r-0 flex flex-col gap-1 transition-colors relative",
                  isClosedDay(day) ? "bg-red-500/5 text-red-500/40" : "hover:bg-secondary/20",
                  isToday && "bg-primary/5"
                )}>
                  <div className={cn("text-[10px] uppercase font-black tracking-widest", isToday && "text-primary")}>{format(day, "EEE")}</div>
                  <div className={cn("text-base font-black tracking-tighter", isToday && "text-primary")}>{format(day, "d")}</div>
                  {isToday && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-border/40 relative">
            {/* Today Vertical Marker Line */}
            <div className="absolute inset-y-0 pointer-events-none z-40 overflow-hidden" style={{ width: '1400px' }}>
              {days.map((day, i) => isSameDay(day, new Date()) && (
                <div key="today-line" className="absolute h-full w-px bg-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.4)] z-40" style={{ left: `${280 + (i * (1120/14))}px` }}>
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-primary text-[9px] font-black text-white rounded-lg uppercase tracking-tighter shadow-2xl shadow-primary/40 ring-4 ring-background/50">Today</div>
                </div>
              ))}
            </div>

            {activeBookings.map((b, bIdx) => {
              const bStart = new Date(b.date);
              const bEnd = addDays(bStart, (b.estimatedDays || 1) - 1);
              
              return (
                <div key={b.id} className="grid grid-cols-[280px_repeat(14,1fr)] group hover:bg-secondary/5 transition-colors">
                  <div className="p-6 border-r border-border/40 flex items-center gap-4 bg-background/40 backdrop-blur-md sticky left-0 z-30">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                        <Car className="h-5 w-5" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border-2 border-border/40 flex items-center justify-center text-[8px] font-black">{bIdx + 1}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black tracking-tight truncate group-hover:text-primary transition-colors">{b.clientName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="text-[9px] font-bold text-muted-foreground truncate uppercase opacity-40 tracking-widest">{b.plate}</div>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <div className="text-[9px] font-black text-primary uppercase tracking-tighter">Bay {Math.floor(bIdx % 5) + 1}</div>
                      </div>
                    </div>
                  </div>
                  
                  {days.map(day => {
                    const isOccupied = isWithinInterval(day, { start: bStart, end: bEnd });
                    const isStart = isSameDay(day, bStart);
                    const isEnd = isSameDay(day, bEnd);
                    
                    return (
                      <div key={day.toISOString()} className="p-1 border-r border-border/40 last:border-r-0 relative min-h-[80px]">
                        {isOccupied && (
                          <div 
                            onClick={() => onSelect(b)}
                            className={cn(
                              "absolute inset-y-3 inset-x-0 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] z-10 flex flex-col justify-center overflow-hidden",
                              isStart && "left-2 rounded-l-2xl shadow-l-xl",
                              isEnd && "right-2 rounded-r-2xl shadow-r-xl",
                              !isStart && !isEnd && "mx-0",
                              b.priority === "high" ? "bg-red-500 shadow-lg shadow-red-500/20" : 
                              b.priority === "medium" ? "bg-orange-500 shadow-lg shadow-orange-500/20" : 
                              "bg-primary shadow-lg shadow-primary/20"
                            )}
                          >
                            {/* Subtle Glass Pattern */}
                            <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
                            
                            <div className="h-full w-full flex flex-col justify-center px-4 relative z-10">
                              {isStart && (
                                <>
                                  <div className="text-[8px] font-black text-white uppercase tracking-tighter truncate leading-none">
                                    {b.status}
                                  </div>
                                  <div className="text-[7px] font-bold text-white/60 uppercase tracking-widest mt-1 truncate">
                                    {b.technician ? b.technician.split(' ')[0] : 'Unassigned'}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {activeBookings.length === 0 && (
              <div className="p-20 text-center opacity-20">
                <div className="text-[10px] font-black uppercase tracking-[0.4em]">No Active Workloads</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingIntake({ bookings, onSelect, onConfirm }: { 
  bookings: Booking[]; 
  onSelect: (b: Booking) => void;
  onConfirm: (id: string) => void;
}) {
  const pending = bookings.filter(b => !b.isConfirmed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Filter className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">Intake Queue</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Vetting & Resource Allocation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/40 backdrop-blur-xl">
           <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
           <span className="text-[10px] font-black uppercase tracking-widest">{pending.length} Requests Pending</span>
        </div>
      </div>

      <div className="grid gap-4">
        {pending.map(b => {
          const issuesCount = b.issue?.length || 0;
          return (
            <div key={b.id} className="group relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-background/40 backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:bg-background/60">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                
                {/* Client & Vehicle Identity */}
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                    <Car className="h-10 w-10 transition-transform group-hover:scale-110" />
                    {issuesCount > 3 && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">!</div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-black tracking-tighter">{b.clientName}</h3>
                      <div className="px-2 py-0.5 rounded-lg bg-foreground/5 text-[9px] font-black tracking-widest uppercase opacity-40">{b.plate}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-muted-foreground">
                      <span className="text-foreground">{b.make} {b.model}</span>
                      <span className="opacity-30">/</span>
                      <span className="uppercase tracking-widest">{b.serviceType}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <Clock className="h-3.5 w-3.5" /> {format(new Date(b.date), "MMM d, h:mm a")}
                      </div>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                        <MessageCircle className="h-3.5 w-3.5" /> {b.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Summary */}
                <div className="flex items-center gap-12 lg:px-12 lg:border-x border-border/40">
                  <div className="flex flex-col gap-1">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Diagnostic Load</div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-black tracking-tighter">{issuesCount}</span>
                      <span className="text-[10px] font-bold uppercase opacity-30 mb-1">Points</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Estimated Time</div>
                    <div className="text-xs font-black tracking-tight">{b.estimatedDays} Day{b.estimatedDays !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => onSelect(b)} 
                    className="rounded-full h-14 px-8 border-border/60 font-bold tracking-tight hover:bg-secondary transition-all active:scale-95"
                  >
                    Review Map
                  </Button>
                  <Button 
                    onClick={() => onConfirm(b.id)} 
                    className="rounded-full h-14 px-8 bg-red-500 hover:bg-red-600 text-white font-black tracking-tight transition-all shadow-xl shadow-red-500/20 hover:shadow-red-500/40 active:scale-95"
                  >
                    Confirm Order
                  </Button>
                </div>
              </div>

              {/* Background Accent Gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
        {pending.length === 0 && (
          <div className="py-24 text-center">
            <div className="h-20 w-20 bg-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl font-black tracking-tighter">Queue Clear</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-2">All incoming requests have been processed.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RepairModal({ booking, onClose, onUpdate, onConfirm, onQuote, onAssign, onPriority, onUpdateDays, onDetailedQuote }: {
  booking: Booking | null;
  onClose: () => void;
  onUpdate: (s: Status) => void;
  onConfirm: () => void;
  onQuote: (q: number) => void;
  onAssign: (t: string) => void;
  onPriority: (p: Booking["priority"]) => void;
  onUpdateDays: (d: number) => void;
  onDetailedQuote: (items: any[]) => void;
}) {
  const [quoteVal, setQuoteVal] = useState("");
  const [items, setItems] = useState<{ description: string; price: number }[]>([]);
  const [newItem, setNewItem] = useState({ description: "", price: "" });

  // Sync items when booking changes
  useMemo(() => {
    if (booking?.quoteItems) {
      setItems(booking.quoteItems);
    } else {
      setItems([]);
    }
  }, [booking?.id]);

  const addItem = () => {
    if (newItem.description && newItem.price) {
      setItems([...items, { description: newItem.description, price: Number(newItem.price) }]);
      setNewItem({ description: "", price: "" });
    }
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto border-white/10 bg-background/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden">
        {booking && (
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-8 pt-8 pb-4 border-b border-white/5 bg-secondary/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary text-white grid place-items-center shadow-lg shadow-primary/20">
                  <Wrench className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-2xl font-black tracking-tighter leading-tight">{booking.make} {booking.model}</DialogTitle>
                  <DialogDescription className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">{booking.id} · {booking.plate}</DialogDescription>
                </div>
              </div>
              <TabsList className="bg-background/50 rounded-full h-11 p-1">
                <TabsTrigger value="overview" className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest">General</TabsTrigger>
                <TabsTrigger value="quote" className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest flex gap-2 items-center">
                  <Star className="h-3.5 w-3.5" /> Quote Gen
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-8 mt-0">
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <Info icon={User} label="Client" value={booking.clientName} />
                    <Info icon={MessageCircle} label="Contact" value={booking.phone || "No phone"} />
                    <Info icon={Clock} label="Appointment" value={format(new Date(booking.date), "MMM d, h:mm a")} />
                    <Info icon={TrendingUp} label="Service Type" value={booking.serviceType} />
                  </div>

                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Workshop Controls</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Lifecycle Status</label>
                        <Select value={booking.status} onValueChange={(v) => onUpdate(v as Status)}>
                          <SelectTrigger className="rounded-2xl h-12 bg-secondary/40 border-border/40"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Priority Level</label>
                        <Select value={booking.priority || "medium"} onValueChange={(v) => onPriority(v as any)}>
                          <SelectTrigger className="rounded-2xl h-12 bg-secondary/40 border-border/40"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">Urgent / High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Assign Technician</label>
                        <Select value={booking.technician || ""} onValueChange={onAssign}>
                          <SelectTrigger className="rounded-2xl h-12 bg-secondary/40 border-border/40"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="Alex Rivera">Alex Rivera</SelectItem>
                            <SelectItem value="Sam Lee">Sam Lee</SelectItem>
                            <SelectItem value="Jordan Smith">Jordan Smith</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Est. Duration (Days)</label>
                        <Select value={booking.estimatedDays?.toString() || "1"} onValueChange={(v) => onUpdateDays(Number(v))}>
                          <SelectTrigger className="rounded-2xl h-12 bg-secondary/40 border-border/40"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {[1, 2, 3, 4, 5, 7, 10, 14].map(d => (
                              <SelectItem key={d} value={d.toString()}>{d} {d === 1 ? "Day" : "Days"}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    {!booking.isConfirmed ? (
                      <Button onClick={onConfirm} className="w-full h-14 rounded-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest shadow-xl shadow-red-500/20">
                        Confirm & Activate Appointment
                      </Button>
                    ) : (
                      <div className="flex gap-4">
                        <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-full border-border/40 font-bold uppercase tracking-widest text-[10px]">Close Portal</Button>
                        <WhatsAppButton booking={booking} className="flex-1 h-14 rounded-full mt-0 shadow-xl shadow-emerald-500/20" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="rounded-[2rem] bg-secondary/30 p-6 space-y-6 border border-border/20">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Primary Complaint</div>
                      <p className="text-sm leading-relaxed font-medium italic">"{booking.issue}"</p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-4 flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5" /> Digital Evidence Archive
                      </div>
                      {booking.photos && booking.photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {booking.photos.map((p, i) => (
                            <div key={i} className="group relative aspect-square rounded-[2rem] overflow-hidden border border-border/40 bg-background shadow-lg transition-all duration-500">
                              <img src={p} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-48 rounded-[2rem] border border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center gap-3">
                           <Camera className="h-8 w-8 text-muted-foreground/20" />
                           <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No Evidence Captured</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quote" className="p-8 mt-0 space-y-8 anim-in overflow-y-auto max-h-[70vh]">
              <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12">
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Technical Bill of Materials</div>
                      <h4 className="text-xl font-black tracking-tight">Active Quote Construction</h4>
                    </div>
                    <div className="flex gap-2">
                       <div className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{items.length} Items</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <div key={i} className="group relative flex items-center justify-between p-5 rounded-3xl bg-secondary/10 border border-border/40 hover:bg-secondary/20 hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                            item.description.toLowerCase().includes('labor') ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                          )}>
                            {item.description.toLowerCase().includes('labor') ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-black text-sm tracking-tight">{item.description}</div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-40">
                              {item.description.toLowerCase().includes('labor') ? 'Technical Labor' : 'Certified Parts'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-mono font-black text-lg text-foreground">Rs {item.price.toLocaleString()}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(i)}
                            className="h-10 w-10 rounded-2xl text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {items.length === 0 && (
                      <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-[2.5rem] bg-secondary/5">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                           <ListChecks className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                        <h5 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Blueprint Empty</h5>
                        <p className="text-[9px] font-bold text-muted-foreground/30 uppercase mt-2">Add parts or labor to begin quote construction</p>
                      </div>
                    )}
                  </div>

                  {/* New Item Construction Zone */}
                  <div className="p-8 rounded-[2.5rem] bg-background border-2 border-primary/20 shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Sparkles className="h-24 w-24 text-primary" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Item Entry Console</div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px_64px] gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Work Description</label>
                        <input 
                          placeholder="e.g. OEM Brake Disc (Front Pair)"
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          className="w-full h-14 rounded-2xl bg-secondary/20 border border-border/40 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Unit Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40">Rs</span>
                          <input 
                            type="number"
                            placeholder="0"
                            value={newItem.price}
                            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                            className="w-full h-14 rounded-2xl bg-secondary/20 border border-border/40 pl-10 pr-4 text-sm font-mono font-black outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addItem} className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Technician Context */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Technician Context & Findings</div>
                    <textarea 
                      placeholder="Explain the necessity of these repairs to the client..."
                      className="w-full h-32 rounded-[2rem] bg-secondary/10 border border-border/40 p-6 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Financial Summary Engine */}
                  <div className="rounded-[2.5rem] bg-foreground text-background p-10 shadow-2xl space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white to-primary opacity-20" />
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Subtotal</div>
                        <div className="text-xl font-mono font-black">Rs {total.toLocaleString()}</div>
                      </div>
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 text-primary">VAT (15%)</div>
                        <div className="text-xl font-mono font-black">Rs {(total * 0.15).toLocaleString()}</div>
                      </div>
                      <div className="pt-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3">Grand Total Ledger</div>
                        <div className="text-6xl font-black tracking-tighter">Rs {(total * 1.15).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        onClick={() => {
                          onDetailedQuote(items);
                          toast.success("Operational Quote Dispatched");
                        }}
                        className="w-full h-16 rounded-full bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Zap className="h-5 w-5 mr-3" /> Dispatch to Client
                      </Button>
                      <p className="text-[9px] font-black text-center opacity-30 uppercase tracking-[0.2em]">Broadcast via Neural API to Client Hub</p>
                    </div>
                  </div>

                  {/* Compliance & Workflow State */}
                  <div className="rounded-[2.5rem] bg-secondary/20 border border-border/40 p-8 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                         <ShieldAlert className="h-5 w-5" />
                       </div>
                       <div className="text-[10px] font-black uppercase tracking-widest leading-tight">Regulatory & Workflow Compliance</div>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Dispatch freezes active labor timers",
                        "Client approval triggers parts procurement",
                        "Quote valid for 48 operational hours"
                      ].map((txt, i) => (
                        <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-muted-foreground/60 leading-snug">
                          <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          {txt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-3 flex items-start gap-3">
      <div className="mt-0.5 h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-xs font-semibold">{value}</div>
      </div>
    </div>
  );
}

function statusMessage(b: Booking): string {
  const map: Record<Status, string> = {
    "Booking Confirmed": `your booking for the ${b.make} ${b.model} (${b.plate}) is confirmed.`,
    "Vehicle in Garage": `we've received your ${b.make} ${b.model} (${b.plate}) at the workshop.`,
    "Diagnosing": `our team is diagnosing your ${b.make} ${b.model} (${b.plate}) right now.`,
    "Waiting on Parts": `we're waiting on parts for your ${b.make} ${b.model} (${b.plate}). We'll keep you posted.`,
    "In Repair": `your ${b.make} ${b.model} (${b.plate}) is now in active repair.`,
    "Ready for Pickup": `great news — your ${b.make} ${b.model} (${b.plate}) is ready for pickup!`,
  };
  
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const trackLink = `${origin}/track`;
  
  return `Hi ${b.clientName}, this is FMZ Auto. Update on ref ${b.id}: ${map[b.status]}\n\nTrack your vehicle here: ${trackLink}`;
}

function ReportsView() {
  const revenueData = [
    { name: "Jan", total: 450000 },
    { name: "Feb", total: 520000 },
    { name: "Mar", total: 480000 },
    { name: "Apr", total: 610000 },
    { name: "May", total: 750000 },
    { name: "Jun", total: 890000 },
  ];

  const serviceData = [
    { name: "Diagnostic", value: 35 },
    { name: "Maintenance", value: 45 },
    { name: "Major Repair", value: 20 },
  ];

  const techData = [
    { name: "K. Ram", jobs: 42, revenue: 185000 },
    { name: "S. Lee", jobs: 38, revenue: 162000 },
    { name: "A. Goolam", jobs: 45, revenue: 210000 },
    { name: "J. Doe", jobs: 31, revenue: 145000 },
  ];

  const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-8 anim-in [animation-delay:600ms]">
      {/* Top Level Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Gross Revenue (MTD)", value: "Rs 750,000", change: "+12.5%", icon: TrendingUp, color: "text-green-500" },
          { label: "Avg. Ticket Price", value: "Rs 14,200", change: "+4.2%", icon: CreditCard, color: "text-blue-500" },
          { label: "Customer Retention", value: "68%", change: "+2.1%", icon: Users, color: "text-primary" }
        ].map((stat, i) => (
          <div key={i} className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-8 hover:shadow-2xl transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={cn("text-[10px] font-black uppercase tracking-widest", stat.color)}>{stat.change}</div>
            </div>
            <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Revenue Chart */}
        <div className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-8 hover:shadow-2xl transition-all duration-700">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black tracking-tighter">Revenue Velocity</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">FY 2026 Performance Stream</p>
            </div>
            <div className="flex gap-2 bg-secondary/50 p-1 rounded-xl">
              <div className="px-3 py-1 bg-background rounded-lg text-[9px] font-black uppercase shadow-sm">Monthly</div>
              <div className="px-3 py-1 text-[9px] font-black uppercase opacity-40">Quarterly</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }}
                  tickFormatter={(v) => `Rs ${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                  labelStyle={{ fontWeight: 900, fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Mix */}
        <div className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-8 hover:shadow-2xl transition-all duration-700 flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-black tracking-tighter">Service Mix</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Market Share by Job Type</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {serviceData.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                  <span className="text-[9px] font-bold text-muted-foreground opacity-40">{s.value}% Share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technician Leaderboard */}
      <div className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-8 hover:shadow-2xl transition-all duration-700">
        <div className="mb-10">
          <h3 className="text-2xl font-black tracking-tighter">Technician Throughput</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Operational Efficiency Ledger</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techData.map((t, i) => (
            <div key={i} className="p-6 rounded-3xl bg-secondary/20 border border-border/20 flex flex-col gap-4 group hover:bg-secondary/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center font-black text-xs">{t.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest">{t.jobs} Jobs</div>
              </div>
              <div>
                <div className="text-sm font-black tracking-tight">{t.name}</div>
                <div className="text-lg font-black tracking-tighter text-muted-foreground mt-1">Rs {t.revenue.toLocaleString()}</div>
              </div>
              <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(t.jobs / 50) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhatsAppButton({ booking, className }: { booking: Booking; className?: string }) {
  const send = () => {
    const msg = statusMessage(booking);
    const phone = (booking.phone ?? "").replace(/[^\d]/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    if (typeof window !== "undefined") {
      try { window.open(url, "_blank", "noopener,noreferrer"); } catch {}
    }
    toast.success("WhatsApp update prepared", { description: msg.slice(0, 90) + "…" });
  };
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); send(); }}
      className={cn("mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[11px] font-medium text-white hover:opacity-90 transition-opacity", className)}
    >
      <MessageCircle className="h-3.5 w-3.5" />
      Send Update
    </button>
  );
}

function QrKioskCard() {
  const url = typeof window !== "undefined" ? `${window.location.origin}/book` : "/book";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="group relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-background/40 backdrop-blur-xl p-7 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:bg-background/60">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Walk-in Kiosk</span>
              <div className="text-2xl font-black tracking-tighter leading-none">Print Gate QR</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center transition-transform group-hover:rotate-12">
              <QrCode className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3 text-[10px] font-bold text-primary group-hover:gap-4 transition-all">
            <Printer className="h-3.5 w-3.5" />
            <span className="uppercase tracking-widest">Open & Print Arrival Pass</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-white/10 bg-background/90 backdrop-blur-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">Gate Access QR</DialogTitle>
          <DialogDescription className="text-xs font-medium uppercase tracking-widest opacity-60">FMZ Auto Studio · Intake Node</DialogDescription>
        </DialogHeader>
        <div className="grid place-items-center py-8">
          <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform" />
            <QRCodeSVG value={url} size={200} bgColor="#ffffff" fgColor="#000000" className="relative z-10" />
          </div>
          <div className="mt-6 font-mono text-[10px] text-muted-foreground break-all text-center opacity-40 hover:opacity-100 transition-opacity">{url}</div>
        </div>
        <DialogFooter className="sm:justify-center border-t border-border/40 pt-6">
          <Button onClick={() => window.print()} className="rounded-full h-12 px-8 bg-foreground text-background hover:bg-foreground/90 font-bold transition-all hover:scale-105 active:scale-95">
            <Printer className="h-4 w-4 mr-2" /> Print Gate Poster
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotificationHub() {
  const notifications = [
    { id: 1, type: 'booking', title: 'New Appointment', desc: 'BMW 320i - K. Ram (Pending Vetting)', time: '2m ago', urgent: true },
    { id: 2, type: 'parts', title: 'Parts Delivered', desc: 'Brake Pads for Audi A4 (Ref: 9021)', time: '15m ago', urgent: false },
    { id: 3, type: 'status', title: 'Job Completed', desc: 'Toyota Hilux marked Ready for Pickup', time: '1h ago', urgent: false },
    { id: 4, type: 'urgent', title: 'Delayed Job', desc: 'Mercedes C200 - Inbay > 4 days', time: '3h ago', urgent: true },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group relative h-14 w-14 rounded-full bg-secondary/50 backdrop-blur-xl border border-border/40 flex items-center justify-center hover:bg-background transition-all duration-500 shadow-lg">
          <div className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary rounded-full animate-ping shadow-[0_0_10px_var(--primary)]" />
          <div className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background" />
          <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-background/80 backdrop-blur-2xl border-border/40 rounded-[2.5rem] shadow-2xl overflow-hidden mt-4" align="end">
        <div className="p-8 border-b border-border/20 bg-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tighter">Workshop Pulse</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Live Operations Feed</p>
            </div>
            <div className="px-3 py-1 bg-primary text-white text-[9px] font-black rounded-full uppercase tracking-tighter">4 New</div>
          </div>
        </div>
        <div className="max-h-[450px] overflow-y-auto modern-scrollbar">
          {notifications.map((n, i) => (
            <div key={n.id} className={cn(
              "p-6 flex gap-4 hover:bg-secondary/20 transition-all border-b border-border/10 last:border-0 group cursor-pointer",
              n.urgent && "bg-primary/[0.02]"
            )}>
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform",
                n.type === 'booking' ? "bg-blue-500/10 text-blue-500" :
                n.type === 'parts' ? "bg-green-500/10 text-green-500" :
                n.type === 'urgent' ? "bg-red-500/10 text-red-500" :
                "bg-orange-500/10 text-orange-500"
              )}>
                {n.type === 'booking' && <CalIcon className="h-5 w-5" />}
                {n.type === 'parts' && <Package className="h-5 w-5" />}
                {n.type === 'urgent' && <AlertCircle className="h-5 w-5" />}
                {n.type === 'status' && <Check className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black tracking-tight">{n.title}</span>
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">{n.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-secondary/10 text-center">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors">Clear All Notifications</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Admin() {
  const { bookings, updateStatus, confirmBooking, setQuote, assignTechnician, setPriority, setEstimatedDays, setDetailedQuote } = useBookings();
  const [selected, setSelected] = useState<Booking | null>(null);

  const inGarage = bookings.filter((b) => !["Booking Confirmed", "Ready for Pickup"].includes(b.status)).length;
  const pendingCount = bookings.filter(b => !b.isConfirmed).length;
  
  const projectedRevenue = bookings
    .filter(b => b.isConfirmed && b.quote)
    .reduce((acc, b) => acc + (b.quote || 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 anim-in">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
            Workshop <span className="text-glow opacity-80">OS.</span>
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground/60">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationHub />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16 anim-in [animation-delay:200ms]">
        <Stat icon={DollarSign} label="Projected Revenue" value={`Rs ${projectedRevenue.toLocaleString()}`} hint="Confirmed Quotes" accent />
        <Stat icon={Car} label="Active Jobs" value={inGarage} hint="Vehicles in bay" />
        <Stat icon={Clock} label="Pending Intake" value={pendingCount} hint="Awaiting vetting" />
        <QrKioskCard />
      </div>

      <Tabs defaultValue="kanban" className="anim-in [animation-delay:300ms]">
        <div className="mb-10 flex justify-center">
          <TabsList className="h-14 p-1.5 bg-secondary/50 backdrop-blur-xl rounded-full border border-border/40 flex items-center min-w-fit">
            <TabsTrigger value="kanban" className="rounded-full px-6 py-2.5 flex gap-2.5 items-center data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
              <ListChecks className="h-4 w-4" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Kanban Board</span>
            </TabsTrigger>
            <TabsTrigger value="intake" className="rounded-full px-6 py-2.5 flex gap-2.5 items-center relative data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
              <Filter className="h-4 w-4" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Pending Intake</span>
              {pendingCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-500/40">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-full px-6 py-2.5 flex gap-2.5 items-center data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
              <CalIcon className="h-4 w-4" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Schedule View</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="rounded-full px-6 py-2.5 flex gap-2.5 items-center data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
              <CalendarRange className="h-4 w-4" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Planning View</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full px-6 py-2.5 flex gap-2.5 items-center data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
              <PieChartIcon className="h-4 w-4" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Reports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-6">
          <Kanban bookings={bookings} onSelect={setSelected} onMove={(b, s) => {
            updateStatus(b.id, s);
            toast.success(`${b.make} ${b.model} → ${s}`);
          }} />
        </TabsContent>

        <TabsContent value="intake" className="mt-6">
          <PendingIntake bookings={bookings} onSelect={setSelected} onConfirm={(id) => {
            confirmBooking(id);
            toast.success("Appointment Activated");
          }} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView bookings={bookings} onSelect={setSelected} />
        </TabsContent>

        <TabsContent value="planning" className="mt-6">
          <PlanningView bookings={bookings} onSelect={setSelected} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsView />
        </TabsContent>
      </Tabs>

      <footer className="mt-24 pt-12 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="flex flex-col gap-1">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">System Architecture</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            Visual Prototype by <span className="text-foreground">Suhail Wohedally</span> · AI Product Engineer
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">All Systems Operational</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-secondary/50 border border-border/40 text-[9px] font-black uppercase tracking-tighter">
            v1.0.26-STUDIO
          </div>
        </div>
      </footer>

      <RepairModal
        booking={selected}
        onClose={() => setSelected(null)}
        onConfirm={() => {
          if (selected) {
            confirmBooking(selected.id);
            toast.success("Appointment Confirmed");
            setSelected({ ...selected, isConfirmed: true });
          }
        }}
        onQuote={(q) => {
          if (selected) {
            setQuote(selected.id, q);
            toast.success("Quote Updated");
            setSelected({ ...selected, quote: q });
          }
        }}
        onDetailedQuote={(items) => {
          if (selected) {
            setDetailedQuote(selected.id, items);
            setSelected({ ...selected, quoteItems: items, quoteStatus: "pending" });
          }
        }}
        onAssign={(t) => {
          if (selected) {
            assignTechnician(selected.id, t);
            toast.success(`Assigned to ${t}`);
            setSelected({ ...selected, technician: t });
          }
        }}
        onPriority={(p) => {
          if (selected) {
            setPriority(selected.id, p);
            toast.success(`Priority set to ${p}`);
            setSelected({ ...selected, priority: p });
          }
        }}
        onUpdateDays={(d) => {
          if (selected) {
            setEstimatedDays(selected.id, d);
            toast.success(`Estimated duration: ${d} days`);
            setSelected({ ...selected, estimatedDays: d });
          }
        }}
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
