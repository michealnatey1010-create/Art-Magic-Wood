"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, TranslationKeys } from "@/data/translations";

type Language = "en" | "ar";
type Direction = "ltr" | "rtl";

interface LanguageContextProps {
  locale: Language;
  direction: Direction;
  t: (key: keyof TranslationKeys, replacements?: Record<string, string | number>) => string;
  toggleLanguage: () => void;
  setLocale: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Language>("ar"); // Default to Arabic (as requested for RTL support)
  const [direction, setDirection] = useState<Direction>("rtl");

  // Sync state with HTML direction and lang attribute on change
  useEffect(() => {
    // Check local storage on mount
    const savedLocale = localStorage.getItem("locale") as Language | null;
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocaleState(savedLocale);
      setDirection(savedLocale === "ar" ? "rtl" : "ltr");
    }
  }, []);

  const setLocale = (lang: Language) => {
    setLocaleState(lang);
    const dir = lang === "ar" ? "rtl" : "ltr";
    setDirection(dir);
    localStorage.setItem("locale", lang);
    
    // Dynamically adjust root html tag attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [locale, direction]);

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "ar" : "en");
  };

  // Translation helper function
  const t = (key: keyof TranslationKeys, replacements?: Record<string, string | number>): string => {
    const translationSet = translations[locale];
    let text = (translationSet[key] || translations["en"][key] || String(key)) as string;
    
    if (replacements) {
      Object.entries(replacements).forEach(([replaceKey, replaceVal]) => {
        text = text.replace(`{${replaceKey}}`, String(replaceVal));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, direction, t, toggleLanguage, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
