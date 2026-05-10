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
        "shrink-0 grid place-items-center rounded-full border-2 transition-all select-none",
        dim,
        active
          ? "bg-primary text-primary-foreground border-primary scale-110 anim-pulse-dot"
          : "bg-background text-foreground border-foreground/20 hover:border-foreground/50",
        className
      )}
    >
      <Mic className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span className="sr-only">{active ? t("speak.listening") : t("speak.hold")}</span>
    </button>
  );
}
