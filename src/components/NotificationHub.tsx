import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NotificationHub() {
  const notifications = [
    { id: 1, type: 'booking', title: 'New Appointment', desc: 'BMW 320i - K. Ram (Pending Vetting)', time: '2m ago', urgent: true },
    { id: 2, type: 'parts', title: 'Parts Delivered', desc: 'Brake Pads for Audi A4 (Ref: 9021)', time: '15m ago', urgent: false },
    { id: 3, type: 'status', title: 'Job Completed', desc: 'Toyota Hilux marked Ready for Pickup', time: '1h ago', urgent: false },
    { id: 4, type: 'urgent', title: 'Delayed Job', desc: 'Mercedes C200 - Inbay > 4 days', time: '3h ago', urgent: true },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group relative h-8 w-8 md:h-10 md:w-10 rounded-full bg-secondary/50 backdrop-blur-xl border border-border/40 flex items-center justify-center hover:bg-background transition-all duration-500 shadow-sm">
          <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full animate-ping shadow-[0_0_10px_var(--primary)]" />
          <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
          <Bell className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] md:w-[400px] p-0 bg-background/80 backdrop-blur-2xl border-border/40 rounded-[2rem] shadow-2xl overflow-hidden mt-4" align="end">
        <div className="p-6 md:p-8 border-b border-border/20 bg-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-black tracking-tighter">Workshop Pulse</h3>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Live Operations Feed</p>
            </div>
            <div className="px-3 py-1 bg-primary text-white text-[9px] font-black rounded-full uppercase tracking-tighter">4 New</div>
          </div>
        </div>
        <div className="max-h-[350px] md:max-h-[450px] overflow-y-auto modern-scrollbar">
          {notifications.map((n) => (
            <div key={n.id} className={cn(
              "p-4 md:p-6 flex gap-4 hover:bg-secondary/20 transition-all border-b border-border/10 last:border-0 group cursor-pointer",
              n.urgent && "bg-primary/[0.02]"
            )}>
              <div className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform",
                n.urgent ? "bg-red-500/10 text-red-500" : "bg-secondary text-muted-foreground"
              )}>
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] md:text-xs font-black tracking-tight truncate">{n.title}</span>
                  <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground/40 uppercase">{n.time}</span>
                </div>
                <p className="text-[9px] md:text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
