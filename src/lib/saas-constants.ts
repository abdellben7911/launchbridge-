// Shared constants for the SaaS app.
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "documents_review",
  "filed",
  "ein_pending",
  "ein_received",
  "banking_setup",
  "gateway_setup",
  "completed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, { en: string; fr: string; ar: string }> = {
  pending_payment: { en: "Pending payment", fr: "Paiement en attente", ar: "بانتظار الدفع" },
  paid: { en: "Paid", fr: "Payé", ar: "مدفوع" },
  documents_review: { en: "Documents review", fr: "Revue des documents", ar: "مراجعة الوثائق" },
  filed: { en: "LLC filed", fr: "LLC déposée", ar: "تم تأسيس LLC" },
  ein_pending: { en: "EIN pending", fr: "EIN en attente", ar: "EIN قيد الإصدار" },
  ein_received: { en: "EIN received", fr: "EIN reçu", ar: "تم استلام EIN" },
  banking_setup: { en: "Banking setup", fr: "Configuration bancaire", ar: "إعداد الحساب البنكي" },
  gateway_setup: { en: "Payment gateway", fr: "Passerelle de paiement", ar: "بوابة الدفع" },
  completed: { en: "Completed", fr: "Terminé", ar: "مكتمل" },
};

export const COUNTRIES: { code: string; name: string; flag: string; dial: string }[] = [
  { code: "ma", name: "Morocco", flag: "🇲🇦", dial: "+212" },
  { code: "dz", name: "Algeria", flag: "🇩🇿", dial: "+213" },
  { code: "tn", name: "Tunisia", flag: "🇹🇳", dial: "+216" },
  { code: "eg", name: "Egypt", flag: "🇪🇬", dial: "+20" },
  { code: "sa", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966" },
  { code: "ae", name: "UAE", flag: "🇦🇪", dial: "+971" },
  { code: "qa", name: "Qatar", flag: "🇶🇦", dial: "+974" },
  { code: "kw", name: "Kuwait", flag: "🇰🇼", dial: "+965" },
  { code: "bh", name: "Bahrain", flag: "🇧🇭", dial: "+973" },
  { code: "om", name: "Oman", flag: "🇴🇲", dial: "+968" },
  { code: "jo", name: "Jordan", flag: "🇯🇴", dial: "+962" },
  { code: "lb", name: "Lebanon", flag: "🇱🇧", dial: "+961" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬", dial: "+234" },
  { code: "ke", name: "Kenya", flag: "🇰🇪", dial: "+254" },
  { code: "sn", name: "Senegal", flag: "🇸🇳", dial: "+221" },
  { code: "ci", name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225" },
  { code: "gh", name: "Ghana", flag: "🇬🇭", dial: "+233" },
  { code: "us", name: "United States", flag: "🇺🇸", dial: "+1" },
  { code: "fr", name: "France", flag: "🇫🇷", dial: "+33" },
  { code: "uk", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { code: "ca", name: "Canada", flag: "🇨🇦", dial: "+1" },
  { code: "other", name: "Other", flag: "🌍", dial: "+" },
];

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "ar", name: "العربية" },
] as const;

export const CURRENCIES = ["USD", "EUR", "MAD", "SAR", "AED", "GBP"] as const;

export const US_STATES = ["Wyoming", "Delaware", "New Mexico"] as const;
