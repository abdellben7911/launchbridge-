import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/i18n/CurrencyProvider";
import { ChevronDown } from "lucide-react";

export function CurrencyChip() {
  const { currency, all, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-24 end-6 z-30 float-end-bottom">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold shadow-elegant transition-all hover:-translate-y-0.5 hover:border-primary/50"
        aria-label={`Currency: ${currency.name}`}
        title={currency.name}
      >
        <img
          src={`https://flagcdn.com/w40/${currency.flagCode}.png`}
          alt=""
          className="h-4 w-6 rounded-[3px] object-cover ring-1 ring-black/10"
        />
        <span>{currency.code}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full end-0 mb-2 max-h-80 w-56 overflow-auto rounded-2xl border border-border bg-popover p-1 shadow-dramatic">
          {all.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-accent ${
                c.code === currency.code ? "bg-accent/50 text-primary font-semibold" : ""
              }`}
            >
              <img
                src={`https://flagcdn.com/w40/${c.flagCode}.png`}
                alt=""
                className="h-4 w-6 rounded-[3px] object-cover ring-1 ring-black/10 shrink-0"
              />
              <span className="font-semibold">{c.code}</span>
              <span className="ms-1 truncate text-xs text-text-3">{c.name}</span>
              <span className="ms-auto text-xs text-text-3">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
