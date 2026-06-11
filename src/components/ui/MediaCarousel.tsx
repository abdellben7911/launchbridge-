import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode[];
  autoplay?: boolean;
  align?: "start" | "center";
  className?: string;
};

export function MediaCarousel({ children, autoplay = true, align = "start", className }: Props) {
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align, dragFree: false, containScroll: "trimSnaps" },
    autoplay ? [Autoplay({ delay: 4500, stopOnInteraction: true })] : [],
  );
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!embla) return;
    setCount(embla.scrollSnapList().length);
    const onSel = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSel);
    onSel();
  }, [embla]);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div className={className}>
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container gap-5">
          {children.map((child, i) => (
            <div key={i} className="min-w-0 flex-[0_0_85%] md:flex-[0_0_42%] lg:flex-[0_0_32%]">
              {child}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === selected ? "w-8 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={scrollPrev} aria-label="Previous" className="rounded-full border border-border bg-surface p-2.5 hover:border-primary/40 hover:text-primary">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button onClick={scrollNext} aria-label="Next" className="rounded-full border border-border bg-surface p-2.5 hover:border-primary/40 hover:text-primary">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
