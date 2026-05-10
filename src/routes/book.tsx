import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Stethoscope, Wrench, Cog, ChevronLeft, ChevronRight, Check, Loader2, CalendarDays, Camera } from "lucide-react";
import { useBookings, isClosedDay, type ServiceType } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { HoldToSpeak } from "@/components/HoldToSpeak";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PriceBadge } from "@/components/PriceBadge";
import { Wallet, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Service — FMZ Auto" },
      { name: "description", content: "Book your auto service in three simple steps." },
    ],
  }),
  component: Book,
});

const SERVICES: { id: ServiceType; icon: any; desc: string }[] = [
  { id: "Diagnostics", icon: Stethoscope, desc: "Identify the issue" },
  { id: "Routine Service", icon: Cog, desc: "Maintenance & oil" },
  { id: "Mechanical Repair", icon: Wrench, desc: "Fix what's broken" },
];

function Book() {
  const router = useRouter();
  const { addBooking } = useBookings();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [issue, setIssue] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>();

  const canNext = (() => {
    if (step === 1) return !!(clientName && make && model && plate);
    if (step === 2) return !!(serviceType && issue.trim().length > 5);
    if (step === 3) return !!date;
    return false;
  })();

  const submit = async () => {
    if (!date || !serviceType) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const b = addBooking({
      clientName,
      phone,
      make,
      model,
      plate: plate.toUpperCase(),
      serviceType: serviceType as ServiceType,
      issue,
      date: date.toISOString(),
      photos,
    });
    setSubmitting(false);
    toast.success("Booking confirmed", {
      description: `Reference ${b.id} — track your car anytime with plate ${b.plate}.`,
    });
    router.navigate({ to: "/track", search: { plate: b.plate } });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t("book.title")}</h1>
        <span className="text-sm text-muted-foreground">{t("book.step", { n: step })}</span>
      </div>

      {/* Progress */}
      <div className="mb-10 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-secondary"
            )}
          />
        ))}
      </div>

      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-[var(--shadow-elevated)] anim-in" key={step}>
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">{t("book.vehicle.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("book.vehicle.sub")}</p>
            </div>
            <Field label={t("book.field.name")}>
              <div className="flex gap-2 items-center">
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jane Doe" className="h-11 text-base" />
                <HoldToSpeak size="sm" onCapture={(s) => setClientName(s.replace(/[.!]/g, ""))} samples={{
                  en: ["Jane Doe", "Marcus Chen"], fr: ["Amélie Laurent", "Lucas Bernard"], kr: ["Jean Pierre", "Marie Joseph"],
                }} />
              </div>
            </Field>
            <Field label={t("book.field.phone")}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 0100" className="h-11 text-base" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("book.field.make")}>
                <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Porsche" className="h-11 text-base" />
              </Field>
              <Field label={t("book.field.model")}>
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="911" className="h-11 text-base" />
              </Field>
            </div>
            <Field label={t("book.field.plate")}>
              <Input
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="AZ-918-PR"
                className="h-11 text-base uppercase tracking-wider font-mono"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{t("book.service.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("book.service.sub")}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {SERVICES.map(({ id, icon: Icon, desc }) => {
                const active = serviceType === id;
                return (
                  <button
                    key={id}
                    onClick={() => setServiceType(id)}
                    className={cn(
                      "group relative rounded-[2rem] border p-8 text-center transition-all duration-500 overflow-hidden",
                      active
                        ? "border-primary bg-primary/5 shadow-2xl shadow-primary/20 scale-[1.02]"
                        : "border-border/40 hover:border-primary/40 hover:bg-secondary/20 hover:-translate-y-1"
                    )}
                  >
                    <div className={cn(
                      "mx-auto h-16 w-16 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 shadow-inner",
                      active 
                        ? "bg-primary text-white rotate-6 scale-110 shadow-lg shadow-primary/30" 
                        : "bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Icon className="h-7 w-7" />
                    </div>
                    
                    <div className="space-y-1.5 relative z-10">
                      <div className={cn(
                        "text-sm font-black uppercase tracking-widest transition-colors",
                        active ? "text-primary" : "text-foreground"
                      )}>
                        {id}
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold transition-colors",
                        active ? "text-primary/60" : "text-muted-foreground/60"
                      )}>
                        {desc}
                      </div>
                    </div>

                    {active && (
                      <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/10 blur-3xl rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-full">
              <Field label="Visual Intake (Photos)">
                <PhotoUpload photos={photos} onChange={setPhotos} />
              </Field>
            </div>

            <Field label={t("book.field.issue")}>
              <div className="relative group/hub rounded-[2.5rem] border border-border/40 bg-secondary/5 p-6 focus-within:border-primary/40 focus-within:bg-secondary/10 transition-all duration-500 shadow-inner">
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder={t("book.issue.placeholder")}
                  rows={4}
                  className="w-full text-base bg-transparent border-none p-0 resize-none outline-none focus:ring-0 placeholder:text-muted-foreground/30 leading-relaxed appearance-none shadow-none"
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-3 pointer-events-none">
                  <div className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] text-primary transition-all duration-700",
                    issue.length > 0 ? "opacity-40" : "opacity-0 translate-x-4"
                  )}>
                    A.I. Transcription Active
                  </div>
                  <div className="pointer-events-auto">
                    <HoldToSpeak onCapture={(s) => setIssue((prev) => (prev ? prev + " " : "") + s)} />
                  </div>
                </div>
              </div>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">{t("book.date.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("book.date.sub")}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-secondary/5 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => isClosedDay(d) || d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full p-0 pointer-events-auto"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-8",
                  month_caption: "flex justify-center relative items-center mb-4",
                  caption_label: "text-lg font-black uppercase tracking-[0.3em] text-foreground",
                  nav: "flex items-center justify-between absolute w-full z-10",
                  button_previous: "h-10 w-10 bg-background border border-border/40 rounded-2xl flex items-center justify-center hover:bg-secondary transition-all shadow-sm",
                  button_next: "h-10 w-10 bg-background border border-border/40 rounded-2xl flex items-center justify-center hover:bg-secondary transition-all shadow-sm",
                  table: "w-full border-collapse",
                  head_row: "flex w-full mb-4",
                  head_cell: "text-muted-foreground/40 flex-1 font-black text-[10px] uppercase tracking-widest text-center",
                  row: "flex w-full mt-2",
                  cell: "flex-1 relative p-0 text-center focus-within:relative focus-within:z-20",
                  day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-12 w-12 sm:h-14 sm:w-14 p-0 font-bold aria-selected:opacity-100 rounded-2xl transition-all duration-300 hover:scale-110"
                  ),
                  today: "bg-primary/10 text-primary rounded-2xl",
                  selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white shadow-[0_10px_20px_rgba(var(--primary),0.3)] scale-110 rotate-3",
                  outside: "text-muted-foreground/20 opacity-50",
                  disabled: "text-muted-foreground/10 line-through decoration-primary/20",
                }}
              />
            </div>

            {date && (
              <div className="flex items-center justify-between rounded-3xl bg-primary/5 border border-primary/10 px-6 py-5 anim-in">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Selected Appointment</div>
                    <div className="text-lg font-bold">{format(date, "EEEE, MMMM d")}</div>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                  <Check className="h-5 w-5" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> {t("book.back")}
          </Button>
          {step < 3 ? (
            <Button
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              {t("book.continue")} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              disabled={!canNext || submitting}
              onClick={submit}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {t("book.confirm")}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
