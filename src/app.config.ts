/**
 * WORKSHOP OS | Master Configuration
 * Use this file to rebrand the entire application for different clients.
 */

export const AppConfig = {
  // Brand Identity
  brand: {
    name: "FMZ Auto",
    tagline: "Studio-Grade Workshop Management",
    logoText: "FMZ OS",
    engineeredBy: "Suhail Wohedally",
  },

  // SEO & Metadata
  seo: {
    title: "FMZ Auto — Book, Track, Manage",
    description: "Experience the future of automotive service. Book, track, and manage repairs with cinematic precision.",
    ogTitle: "FMZ Auto Workshop OS",
    ogDescription: "The studio-grade operating system for modern workshops.",
    ogImage: "/readme-hero.png", // Path to your preview image
    themeColor: "#0a0a0a",
  },

  // Hero Section (Landing Page)
  hero: {
    titleTop: "Automotive",
    titleAccent: "Excellence.",
    subtext: "The studio-grade OS for the modern workshop. Book in seconds, track with precision, and experience service without friction.",
    ctaPrimary: "Start Your Intake",
    ctaSecondary: "Track Live Status",
  },

  // Localization / I18n Fallback
  defaultLanguage: "en",

  // Feature Toggles (Optional - for future use)
  features: {
    voiceEntry: true,
    liveMap: true,
    analytics: true,
  }
};

export type IAppConfig = typeof AppConfig;
