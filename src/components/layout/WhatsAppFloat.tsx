import { useLang } from "@/i18n/LanguageProvider";
import { whatsAppUrl } from "@/lib/constants";

export function WhatsAppFloat() {
  const { lang } = useLang();
  return (
    <a
      href={whatsAppUrl(lang)}
      target="_blank"
      rel="noreferrer"
      className="wa-float fixed bottom-6 end-6 z-30 float-end-bottom flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <span className="wa-pulse" aria-hidden />
      <span className="wa-pulse wa-pulse-2" aria-hidden />
      <svg viewBox="0 0 32 32" className="wa-glyph relative h-8 w-8" fill="currentColor" aria-hidden>
        <path d="M27.2 4.8A15.84 15.84 0 0 0 15.94 0C7.16 0 .03 7.13.02 15.9c0 2.8.74 5.53 2.13 7.94L0 32l8.36-2.18a15.9 15.9 0 0 0 7.58 1.92h.01c8.78 0 15.92-7.13 15.93-15.9a15.8 15.8 0 0 0-4.68-11.04Zm-11.26 24.5h-.01a13.21 13.21 0 0 1-6.72-1.83l-.48-.28-4.96 1.29 1.32-4.83-.31-.5a13.2 13.2 0 0 1-2.02-7.05c0-7.3 5.95-13.23 13.25-13.23 3.54 0 6.86 1.38 9.36 3.88a13.13 13.13 0 0 1 3.87 9.36c0 7.3-5.95 13.2-13.3 13.2Zm7.27-9.9c-.4-.2-2.37-1.17-2.74-1.3-.36-.14-.63-.2-.9.2-.27.4-1.03 1.3-1.27 1.56-.23.27-.46.3-.86.1-.4-.2-1.68-.62-3.2-1.97-1.18-1.05-1.98-2.36-2.21-2.76-.23-.4-.02-.61.18-.81.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.9-2.17-1.23-2.97-.32-.78-.65-.68-.9-.69h-.76c-.27 0-.7.1-1.06.5-.36.4-1.4 1.37-1.4 3.34 0 1.97 1.44 3.88 1.64 4.14.2.27 2.83 4.32 6.86 6.05.96.41 1.7.66 2.28.85.96.3 1.83.26 2.52.16.77-.12 2.37-.97 2.7-1.9.34-.94.34-1.74.24-1.9-.1-.18-.36-.27-.76-.47Z" />
      </svg>
    </a>
  );
}
