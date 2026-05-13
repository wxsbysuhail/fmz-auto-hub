import { Moon, Sun } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "fr", label: "FR" },
];

export function TopControls() {
  const { lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:inline-flex rounded-full border bg-background/60 p-0.5 text-xs">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={cn(
              "px-2.5 py-1 rounded-full font-medium transition-colors",
              lang === l.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={lang === l.id}
          >
            {l.label}
          </button>
        ))}
      </div>
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="grid h-8 w-8 place-items-center rounded-full border bg-background/60 text-foreground hover:bg-accent transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
