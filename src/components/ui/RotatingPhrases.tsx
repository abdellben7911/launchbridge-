import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  phrases: string[];
  interval?: number;
  className?: string;
};

export function RotatingPhrases({ phrases, interval = 2600, className }: Props) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (phrases.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  return (
    <span className={`relative inline-block align-baseline ${className ?? ""}`} style={{ minWidth: "1ch" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          initial={{ y: "0.6em", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-0.6em", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block font-serif-display bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          {phrases[i] ?? ""}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
