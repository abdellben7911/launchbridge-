import { useState } from "react";
import { Link as LinkIcon, Twitter, Linkedin, Facebook, Check } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 4.13 18.36L3 22l3.78-1.07a10 10 0 0 0 4.95 1.27h.01A10 10 0 0 0 19.05 4.91Zm-7.31 15.42a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-2.25.63.61-2.19-.2-.31a8.31 8.31 0 1 1 6.37 3.21Zm4.55-6.22c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.13-.56.13s-.64.81-.79.97c-.14.17-.29.18-.54.06-.25-.13-1.05-.39-2-1.23a7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48a.92.92 0 0 0-.67.31 2.79 2.79 0 0 0-.88 2.08c0 1.23.9 2.41 1.02 2.58.13.17 1.77 2.69 4.28 3.77 1.5.65 2.08.7 2.83.59.46-.07 1.47-.6 1.68-1.18.2-.59.2-1.09.14-1.19-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

type Props = {
  title: string;
  vertical?: boolean;
};

export function ShareBar({ title, vertical = false }: Props) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;

  const items = [
    { href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, label: "Share on X", Icon: Twitter },
    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, label: "Share on LinkedIn", Icon: Linkedin },
    { href: `https://wa.me/?text=${enc(title + " " + url)}`, label: "Share on WhatsApp", Icon: WhatsAppIcon },
    { href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, label: "Share on Facebook", Icon: Facebook },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className={`flex ${vertical ? "flex-col" : "flex-row flex-wrap"} items-center gap-2`}>
      <button
        onClick={copy}
        aria-label="Copy link"
        title={copied ? "Copied!" : "Copy link"}
        className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-text-2 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <LinkIcon className="h-4 w-4" />}
      </button>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-text-2 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
