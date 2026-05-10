import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Stethoscope, Wrench, Cog, ChevronLeft, ChevronRight, Check, Loader2, CalendarDays } from "lucide-react";
import { useBookings, isClosedDay, type ServiceType } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { HoldToSpeak } from "@/components/HoldToSpeak";

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
  const [date, setDate] = useState<Date | undefined>();

  const canNext =
    (step === 1 && clientName && make && model && plate) ||
    (step === 2 && serviceType && issue.trim().length > 5) ||
    (step === 3 && date);

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
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">{t("book.service.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("book.service.sub")}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SERVICES.map(({ id, icon: Icon, desc }) => {
                const active = serviceType === id;
                return (
                  <button
                    key={id}
                    onClick={() => setServiceType(id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-foreground bg-foreground text-background shadow-[var(--shadow-elevated)] -translate-y-0.5"
                        : "hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="mt-3 text-sm font-medium">{id}</div>
                    <div className={cn("text-xs mt-0.5", active ? "text-background/70" : "text-muted-foreground")}>{desc}</div>
                  </button>
                );
              })}
            </div>
            <Field label={t("book.field.issue")}>
              <div className="flex gap-3 items-start">
                <Textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder={t("book.issue.placeholder")}
                  rows={5}
                  className="text-base"
                />
                <HoldToSpeak onCapture={(s) => setIssue((prev) => (prev ? prev + " " : "") + s)} />
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
            <div className="rounded-2xl border bg-background p-2 grid place-items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => isClosedDay(d) || d < new Date(new Date().setHours(0, 0, 0, 0))}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
            {date && (
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm">
                <CalendarDays className="h-4 w-4" />
                Selected: <span className="font-medium">{format(date, "EEEE, MMMM d")}</span>
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
