import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };

const C = createContext<Ctx | null>(null);

function detect(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("lb-theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(detect());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("lb-theme", theme);
    } catch {}
  }, [theme]);

  return (
    <C.Provider value={{ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")), setTheme }}>
      {children}
    </C.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
