import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface Props {
  onCapture: (text: string) => void;
  /** Sample phrases by language used to simulate speech-to-text */
  samples?: Partial<Record<"en" | "fr" | "kr", string[]>>;
  className?: string;
  size?: "sm" | "lg";
}

const DEFAULT_SAMPLES = {
  en: ["My car is making a strange noise when I brake.", "The engine light came on yesterday."],
  fr: ["Ma voiture fait un bruit étrange au freinage.", "Le voyant moteur s'est allumé hier."],
  kr: ["Machin mwen ap fè yon bri lè m frennen.", "Limyè motè a limen yè."],
};

export function HoldToSpeak({ onCapture, samples, className, size = "lg" }: Props) {
  const { t, lang } = useI18n();
  const [active, setActive] = useState(false);
  const startRef = useRef<number>(0);

  const start = () => {
    setActive(true);
    startRef.current = Date.now();
  };

  const end = () => {
    if (!active) return;
    setActive(false);
    const held = Date.now() - startRef.current;
    if (held < 300) return; // tap, not a hold
    const pool = (samples?.[lang] ?? DEFAULT_SAMPLES[lang] ?? DEFAULT_SAMPLES.en);
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    onCapture(phrase);
    toast.success(t("speak.captured"));
  };

  const dim = size === "lg" ? "h-12 w-12" : "h-9 w-9";

  return (
    <div className="relative">
      {active && (
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10 scale-150" />
      )}
      <button
        type="button"
        aria-label={t("speak.hold")}
        title={t("speak.hold")}
        onMouseDown={start}
        onMouseUp={end}
        onMouseLeave={() => active && end()}
        onTouchStart={(e) => { e.preventDefault(); start(); }}
        onTouchEnd={(e) => { e.preventDefault(); end(); }}
        className={cn(
          "shrink-0 grid place-items-center rounded-full border-2 transition-all duration-500 select-none relative z-10",
          dim,
          active
            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_30px_rgba(var(--primary),0.5)] scale-110"
            : "bg-background text-foreground border-border/40 hover:border-primary/40 hover:bg-secondary/30",
          className
        )}
      >
        <Mic className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
        <span className="sr-only">{active ? t("speak.listening") : t("speak.hold")}</span>
      </button>
    </div>
  );
}
