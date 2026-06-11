import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "secondary" | "outlined" | "dark" | "glass" | "image" | "mesh";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: ReactNode;
  image?: string;
  interactive?: boolean;
}

export function BentoCard({ variant = "default", className, children, image, interactive = true, style, ...rest }: Props) {
  const styles: Record<Variant, string> = {
    default: "bg-card border border-border text-foreground shadow-bento",
    primary: "text-primary-foreground border border-transparent shadow-elegant [background:var(--gradient-card)] sheen",
    secondary: "bg-secondary-light text-foreground border border-border shadow-bento",
    outlined: "bg-transparent border-2 border-primary/30 text-foreground hover:border-primary/60",
    dark: "bg-foreground text-background border border-transparent shadow-elegant sheen",
    glass: "bento-glass text-foreground",
    image: "text-white border border-transparent shadow-elegant overflow-hidden",
    mesh: "relative overflow-hidden text-foreground border border-border bg-card bento-mesh shadow-bento",
  };
  const inlineStyle =
    variant === "image" && image
      ? { ...style, backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%), url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
      : style;
  return (
    <div
      style={inlineStyle}
      className={cn(
        "relative rounded-[20px] p-7 transition-all duration-300 will-change-transform",
        interactive && "hover:-translate-y-1 hover:shadow-dramatic",
        styles[variant],
        className,
      )}
      {...rest}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
