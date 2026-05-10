import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr" | "kr";

const DICT = {
  en: {
    "nav.book": "Book",
    "nav.track": "Track",
    "nav.admin": "Admin",
    "book.title": "Book a service",
    "book.step": "Step {n} of 3",
    "book.vehicle.title": "Your vehicle",
    "book.vehicle.sub": "Tell us what we'll be working on.",
    "book.field.name": "Your name",
    "book.field.phone": "Phone (optional)",
    "book.field.make": "Make",
    "book.field.model": "Model",
    "book.field.plate": "License plate",
    "book.service.title": "What do you need?",
    "book.service.sub": "Pick a service and describe the issue.",
    "book.field.issue": "Describe the issue",
    "book.issue.placeholder": "When does it happen? Any noises, lights, or symptoms?",
    "book.date.title": "Choose a date",
    "book.date.sub": "We're closed Wednesdays and Sundays.",
    "book.back": "Back",
    "book.continue": "Continue",
    "book.confirm": "Confirm booking",
    "track.title": "Track your repair",
    "track.sub": "Enter your license plate to see live status.",
    "track.placeholder": "e.g. AZ-918-PR",
    "track.action": "Track",
    "track.locating": "Locating your vehicle…",
    "track.notfound": "No vehicle found",
    "track.notfound.sub": "Double-check the plate, or book a new service.",
    "speak.hold": "Hold to speak",
    "speak.listening": "Listening…",
    "speak.captured": "Voice captured",
  },
  fr: {
    "nav.book": "Réserver",
    "nav.track": "Suivre",
    "nav.admin": "Admin",
    "book.title": "Réserver un service",
    "book.step": "Étape {n} sur 3",
    "book.vehicle.title": "Votre véhicule",
    "book.vehicle.sub": "Dites-nous sur quoi nous allons travailler.",
    "book.field.name": "Votre nom",
    "book.field.phone": "Téléphone (facultatif)",
    "book.field.make": "Marque",
    "book.field.model": "Modèle",
    "book.field.plate": "Plaque d'immatriculation",
    "book.service.title": "De quoi avez-vous besoin ?",
    "book.service.sub": "Choisissez un service et décrivez le problème.",
    "book.field.issue": "Décrivez le problème",
    "book.issue.placeholder": "Quand cela arrive-t-il ? Bruits, voyants, symptômes ?",
    "book.date.title": "Choisissez une date",
    "book.date.sub": "Nous sommes fermés le mercredi et le dimanche.",
    "book.back": "Retour",
    "book.continue": "Continuer",
    "book.confirm": "Confirmer la réservation",
    "track.title": "Suivez votre réparation",
    "track.sub": "Entrez votre plaque pour voir le statut en direct.",
    "track.placeholder": "ex. AZ-918-PR",
    "track.action": "Suivre",
    "track.locating": "Localisation de votre véhicule…",
    "track.notfound": "Véhicule introuvable",
    "track.notfound.sub": "Vérifiez la plaque ou réservez un nouveau service.",
    "speak.hold": "Maintenir pour parler",
    "speak.listening": "Écoute…",
    "speak.captured": "Voix capturée",
  },
  kr: {
    "nav.book": "Rezève",
    "nav.track": "Swiv",
    "nav.admin": "Admin",
    "book.title": "Rezève yon sèvis",
    "book.step": "Etap {n} sou 3",
    "book.vehicle.title": "Machin ou",
    "book.vehicle.sub": "Di nou sa n ap travay sou li.",
    "book.field.name": "Non ou",
    "book.field.phone": "Telefòn (si w vle)",
    "book.field.make": "Mak",
    "book.field.model": "Modèl",
    "book.field.plate": "Plak",
    "book.service.title": "Ki sa w bezwen?",
    "book.service.sub": "Chwazi yon sèvis epi dekri pwoblèm nan.",
    "book.field.issue": "Dekri pwoblèm nan",
    "book.issue.placeholder": "Kilè sa rive? Bri, limyè, oswa sentòm?",
    "book.date.title": "Chwazi yon dat",
    "book.date.sub": "Nou fèmen Mèkredi ak Dimanch.",
    "book.back": "Retounen",
    "book.continue": "Kontinye",
    "book.confirm": "Konfime rezèvasyon",
    "track.title": "Swiv reparasyon ou",
    "track.sub": "Antre plak ou pou wè estati a.",
    "track.placeholder": "egz. AZ-918-PR",
    "track.action": "Swiv",
    "track.locating": "N ap chèche machin ou…",
    "track.notfound": "Pa jwenn machin",
    "track.notfound.sub": "Verifye plak la, oswa rezève yon nouvo sèvis.",
    "speak.hold": "Kenbe pou pale",
    "speak.listening": "M ap koute…",
    "speak.captured": "Vwa anrejistre",
  },
} as const;

type Key = keyof typeof DICT["en"];

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

const STORAGE = "fmz.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE)) as Lang | null;
    if (saved && ["en", "fr", "kr"].includes(saved)) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE, l); } catch {}
  };
  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s = (DICT[lang] as any)[k] ?? (DICT.en as any)[k] ?? k;
    if (vars) for (const [vk, vv] of Object.entries(vars)) s = s.replace(`{${vk}}`, String(vv));
    return s;
  };
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
