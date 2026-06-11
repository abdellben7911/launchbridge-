// Centralized contact constants. Update WHATSAPP_NUMBER once and it propagates.
export const WHATSAPP_NUMBER = "+212619999558";
export const WHATSAPP_DIGITS = WHATSAPP_NUMBER.replace(/\D/g, "");
export const WHATSAPP_MSG: Record<"en" | "fr" | "ar", string> = {
  en: "Hi, I want to learn more about LaunchBridge",
  fr: "Bonjour, je souhaite en savoir plus sur LaunchBridge",
  ar: "مرحباً، أريد معرفة المزيد عن LaunchBridge",
};
export const whatsAppUrl = (lang: "en" | "fr" | "ar" = "en") =>
  `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(WHATSAPP_MSG[lang])}`;
