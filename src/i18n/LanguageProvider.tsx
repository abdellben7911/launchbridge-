import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { t as translate, type Lang } from "./translations";

type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const Ctx = createContext<LanguageCtx | null>(null);

function detect(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("lb-lang") as Lang | null;
    if (stored && ["en", "fr", "ar"].includes(stored)) return stored;
    const nav = navigator.language || "en";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("fr")) return "fr";
  } catch {}
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // CRITICAL: First client render MUST match SSR ("en") to avoid hydration mismatch.
  // The pre-hydration <script> in __root.tsx already sets <html dir/lang> so there
  // is no direction flash. After hydration, useEffect swaps text to the stored lang.
  const [lang, setLangState] = useState<Lang>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const detected = detect();
    if (detected !== "en") setLangState(detected);
    setHydrated(true);
  }, []);

  useLayoutEffect(() => {
    if (!hydrated) return;
    const dir = lang === "ar" ? "rtl" : "ltr";
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    html.classList.toggle("lang-ar", lang === "ar");
    document.body.dir = dir;
    try {
      localStorage.setItem("lb-lang", lang);
    } catch {}
  }, [lang, hydrated]);

  const value: LanguageCtx = {
    lang,
    setLang: setLangState,
    t: (key: string) => translate(key, lang),
    dir: lang === "ar" ? "rtl" : "ltr",
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
