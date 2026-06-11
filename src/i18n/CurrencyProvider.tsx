import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLang } from "@/i18n/LanguageProvider";

export type Currency = {
  code: string;
  symbol: string;
  flag: string;
  flagCode: string;
  rate: number; // vs USD (illustrative mid-2026 reference rates)
  symbolAfter?: boolean;
  name: string;
};

// Rates are illustrative — refresh from a live FX API for production billing.
export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", flag: "🇺🇸", flagCode: "us", rate: 1, name: "US Dollar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", flagCode: "eu", rate: 0.92, name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", flagCode: "gb", rate: 0.79, name: "British Pound" },
  // Middle East & North Africa
  { code: "MAD", symbol: "DH", flag: "🇲🇦", flagCode: "ma", rate: 9.8, symbolAfter: true, name: "Moroccan Dirham" },
  { code: "SAR", symbol: "ر.س", flag: "🇸🇦", flagCode: "sa", rate: 3.75, symbolAfter: true, name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", flagCode: "ae", rate: 3.67, symbolAfter: true, name: "UAE Dirham" },
  { code: "EGP", symbol: "E£", flag: "🇪🇬", flagCode: "eg", rate: 48, name: "Egyptian Pound" },
  { code: "DZD", symbol: "دج", flag: "🇩🇿", flagCode: "dz", rate: 134, symbolAfter: true, name: "Algerian Dinar" },
  { code: "TND", symbol: "DT", flag: "🇹🇳", flagCode: "tn", rate: 3.1, symbolAfter: true, name: "Tunisian Dinar" },
  { code: "LYD", symbol: "LD", flag: "🇱🇾", flagCode: "ly", rate: 4.85, symbolAfter: true, name: "Libyan Dinar" },
  { code: "JOD", symbol: "JD", flag: "🇯🇴", flagCode: "jo", rate: 0.71, symbolAfter: true, name: "Jordanian Dinar" },
  { code: "KWD", symbol: "KD", flag: "🇰🇼", flagCode: "kw", rate: 0.31, symbolAfter: true, name: "Kuwaiti Dinar" },
  { code: "QAR", symbol: "ر.ق", flag: "🇶🇦", flagCode: "qa", rate: 3.64, symbolAfter: true, name: "Qatari Riyal" },
  { code: "BHD", symbol: ".د.ب", flag: "🇧🇭", flagCode: "bh", rate: 0.38, symbolAfter: true, name: "Bahraini Dinar" },
  { code: "OMR", symbol: "ر.ع", flag: "🇴🇲", flagCode: "om", rate: 0.38, symbolAfter: true, name: "Omani Rial" },
  { code: "LBP", symbol: "ل.ل", flag: "🇱🇧", flagCode: "lb", rate: 89500, symbolAfter: true, name: "Lebanese Pound" },
  // West & Sub-Saharan Africa
  { code: "NGN", symbol: "₦", flag: "🇳🇬", flagCode: "ng", rate: 1580, name: "Nigerian Naira" },
  { code: "GHS", symbol: "₵", flag: "🇬🇭", flagCode: "gh", rate: 15.2, name: "Ghanaian Cedi" },
  { code: "XOF", symbol: "CFA", flag: "🇸🇳", flagCode: "sn", rate: 603, symbolAfter: true, name: "West African CFA" },
  { code: "XAF", symbol: "FCFA", flag: "🇨🇲", flagCode: "cm", rate: 603, symbolAfter: true, name: "Central African CFA" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", flagCode: "ke", rate: 129, name: "Kenyan Shilling" },
  { code: "TZS", symbol: "TSh", flag: "🇹🇿", flagCode: "tz", rate: 2545, name: "Tanzanian Shilling" },
  { code: "UGX", symbol: "USh", flag: "🇺🇬", flagCode: "ug", rate: 3760, name: "Ugandan Shilling" },
  { code: "RWF", symbol: "RF", flag: "🇷🇼", flagCode: "rw", rate: 1380, symbolAfter: true, name: "Rwandan Franc" },
  { code: "ETB", symbol: "Br", flag: "🇪🇹", flagCode: "et", rate: 124, name: "Ethiopian Birr" },
  { code: "ZAR", symbol: "R", flag: "🇿🇦", flagCode: "za", rate: 18.4, name: "South African Rand" },
  { code: "MRU", symbol: "UM", flag: "🇲🇷", flagCode: "mr", rate: 39.5, symbolAfter: true, name: "Mauritanian Ouguiya" },
];

const TZ_MAP: Record<string, string> = {
  "Africa/Casablanca": "MAD",
  "Africa/Lagos": "NGN",
  "Africa/Cairo": "EGP",
  "Africa/Algiers": "DZD",
  "Africa/Tunis": "TND",
  "Africa/Tripoli": "LYD",
  "Africa/Dakar": "XOF",
  "Africa/Abidjan": "XOF",
  "Africa/Bamako": "XOF",
  "Africa/Ouagadougou": "XOF",
  "Africa/Lome": "XOF",
  "Africa/Cotonou": "XOF",
  "Africa/Niamey": "XOF",
  "Africa/Douala": "XAF",
  "Africa/Libreville": "XAF",
  "Africa/Brazzaville": "XAF",
  "Africa/Bangui": "XAF",
  "Africa/Ndjamena": "XAF",
  "Africa/Accra": "GHS",
  "Africa/Nairobi": "KES",
  "Africa/Dar_es_Salaam": "TZS",
  "Africa/Kampala": "UGX",
  "Africa/Kigali": "RWF",
  "Africa/Addis_Ababa": "ETB",
  "Africa/Johannesburg": "ZAR",
  "Africa/Nouakchott": "MRU",
  "Asia/Riyadh": "SAR",
  "Asia/Dubai": "AED",
  "Asia/Amman": "JOD",
  "Asia/Kuwait": "KWD",
  "Asia/Qatar": "QAR",
  "Asia/Bahrain": "BHD",
  "Asia/Muscat": "OMR",
  "Asia/Beirut": "LBP",
  "Europe/Paris": "EUR",
  "Europe/London": "GBP",
};

function detect(): string {
  if (typeof window === "undefined") return "USD";
  try {
    const stored = localStorage.getItem("lb-currency");
    if (stored && CURRENCIES.find((c) => c.code === stored)) return stored;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_MAP[tz] || "USD";
  } catch {
    return "USD";
  }
}

type Ctx = {
  currency: Currency;
  setCurrency: (code: string) => void;
  cycle: () => void;
  /** Format a USD amount in the active currency. */
  format: (usd: number) => string;
  /** Format a MAD-denominated amount in the active currency (single source of truth for MAD-priced products). */
  formatFromMAD: (mad: number) => string;
  /** Format an amount in MAD regardless of active currency (used as secondary line). */
  formatMAD: (mad: number) => string;
  all: Currency[];
};

const C = createContext<Ctx | null>(null);

const MAD_PER_USD = CURRENCIES.find((c) => c.code === "MAD")!.rate;

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string>("USD");
  const { lang } = useLang();

  useEffect(() => {
    setCode(detect());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lb-currency", code);
    } catch {}
  }, [code]);

  const value = useMemo<Ctx>(() => {
    const currency = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
    const locale = lang === "fr" ? "fr-FR" : lang === "ar" ? "ar-EG" : "en-US";

    const formatIn = (target: Currency, amount: number) => {
      const whole = target.rate >= 50;
      const rounded = whole ? Math.round(amount) : Math.round(amount * 100) / 100;
      const formatted = new Intl.NumberFormat(locale, {
        maximumFractionDigits: whole ? 0 : 2,
        minimumFractionDigits: 0,
      }).format(rounded);
      return target.symbolAfter
        ? `${formatted}\u00A0${target.symbol}`
        : `${target.symbol}${formatted}`;
    };

    return {
      currency,
      setCurrency: setCode,
      cycle: () => {
        const idx = CURRENCIES.findIndex((c) => c.code === code);
        setCode(CURRENCIES[(idx + 1) % CURRENCIES.length].code);
      },
      format: (usd: number) => formatIn(currency, usd * currency.rate),
      formatFromMAD: (mad: number) => {
        const usd = mad / MAD_PER_USD;
        return formatIn(currency, usd * currency.rate);
      },
      formatMAD: (mad: number) => {
        const mc = CURRENCIES.find((c) => c.code === "MAD")!;
        return formatIn(mc, mad);
      },
      all: CURRENCIES,
    };
  }, [code, lang]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useCurrency() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
  return ctx;
}
