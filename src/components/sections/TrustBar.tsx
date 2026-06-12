import { useRef, useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";

type Brand = {
  name: string;
  src: string;
  suffix?: string;
};

const BRANDS: Brand[] = [
  { name: "Stripe", src: "https://cdn.simpleicons.org/stripe/635BFF" },
  { name: "PayPal", src: "https://cdn.simpleicons.org/paypal/003087", suffix: "Business" },
  { name: "Shopify", src: "https://cdn.simpleicons.org/shopify/96BF48", suffix: "Payments" },
  { name: "Wise", src: "https://cdn.simpleicons.org/wise/9FE870" },
  { name: "Mercury", src: "https://cdn.simpleicons.org/mercury/000000" },
  { name: "Payoneer", src: "https://cdn.simpleicons.org/payoneer/FF4800" },
  { name: "Meta", src: "https://cdn.simpleicons.org/meta/0082FB", suffix: "Ads" },
  { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads/4285F4" },
  { name: "TikTok", src: "https://cdn.simpleicons.org/tiktok/000000", suffix: "Ads" },
  { name: "Snapchat", src: "https://cdn.simpleicons.org/snapchat/FFFC00", suffix: "Ads" },
  { name: "WordPress", src: "https://cdn.simpleicons.org/wordpress/21759B" },
];

const STEP_PX = 160;

function LogoItem({ name, src, suffix }: Brand) {
  return (
    <div className="group/logo mx-8 flex h-16 shrink-0 items-center justify-center gap-2 md:mx-12">
      <div className="flex h-8 items-center">
        <img
          src={src}
          alt={`${name}${suffix ? ` ${suffix}` : ""} logo`}
          loading="lazy"
          className="h-8 w-auto object-contain opacity-70 grayscale transition duration-300 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
        />
      </div>
      {suffix ? (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function TrustBar() {
  const loop = [...BRANDS, ...BRANDS];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    const isRtl =
      typeof document !== "undefined" && document.dir === "rtl";
    const dir = isRtl ? -1 : 1;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        setPaused(true);
        el.scrollBy({ left: STEP_PX * dir, behavior: "smooth" });
        break;
      case "ArrowLeft":
        e.preventDefault();
        setPaused(true);
        el.scrollBy({ left: -STEP_PX * dir, behavior: "smooth" });
        break;
      case "Home":
        e.preventDefault();
        setPaused(true);
        el.scrollTo({ left: 0, behavior: "smooth" });
        break;
      case "End":
        e.preventDefault();
        setPaused(true);
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
        break;
      case " ":
      case "Spacebar":
        e.preventDefault();
        setPaused((p) => !p);
        break;
    }
  };

  return (
    <section className="bg-bg-2/60 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-10 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-primary/20" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                Working with the tools that work
              </span>
              <span className="h-px w-10 bg-primary/20" />
            </div>
            <span className="mt-3 h-1 w-10 rounded-full bg-secondary" />
          </div>
        </Reveal>
      </div>
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label="Partner logos, scrollable"
        onKeyDown={handleKeyDown}
        className="group relative overflow-x-auto overflow-y-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-2 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <span className="sr-only">
          Use arrow keys to scroll, Home and End to jump to the ends, Space to pause or resume.
        </span>
        <div
          dir="ltr"
          className="marquee-track flex w-max items-center group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
          style={paused ? { animationPlayState: "paused" } : undefined}
        >
          {loop.map((b, i) => (
            <LogoItem key={`${b.name}-${b.suffix ?? ""}-${i}`} {...b} />
          ))}
        </div>
      </div>
    </section>
  );
}
