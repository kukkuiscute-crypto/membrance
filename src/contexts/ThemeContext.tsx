import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeKey =
  | "midnight-dark"
  | "midnight-gold"
  | "midnight-teal"
  | "midnight-blue"
  | "midnight-green"
  | "midnight-nature"
  | "midnight-sun"
  | "midnight-sunrise"
  | "midnight-glass"
  | "midnight-grey"
  | "midnight-white"
  | "sakura-pink"
  | "famous-indigo"
  | "neon-mode";

export const THEMES: { key: ThemeKey; label: string; hue: string }[] = [
  { key: "midnight-dark", label: "Midnight Dark", hue: "262 83% 65%" },
  { key: "midnight-gold", label: "Midnight Gold", hue: "45 93% 47%" },
  { key: "midnight-teal", label: "Midnight Teal", hue: "174 72% 45%" },
  { key: "midnight-blue", label: "Midnight Blue", hue: "217 91% 60%" },
  { key: "midnight-green", label: "Midnight Green", hue: "142 71% 45%" },
  { key: "midnight-nature", label: "Midnight Nature", hue: "84 60% 40%" },
  { key: "midnight-sun", label: "Midnight Sun", hue: "32 95% 55%" },
  { key: "midnight-sunrise", label: "Midnight Sunrise", hue: "350 80% 60%" },
  { key: "midnight-glass", label: "Midnight Glass", hue: "200 15% 55%" },
  { key: "midnight-grey", label: "Midnight Grey", hue: "0 0% 50%" },
  { key: "midnight-white", label: "Midnight White", hue: "0 0% 80%" },
  { key: "sakura-pink", label: "Sakura Pink", hue: "330 70% 65%" },
  { key: "famous-indigo", label: "Famous Indigo", hue: "240 70% 55%" },
  { key: "neon-mode", label: "Neon Mode", hue: "120 100% 50%" },
];

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "midnight-dark",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function applyTheme(key: ThemeKey) {
  const t = THEMES.find((th) => th.key === key) || THEMES[0];
  const root = document.documentElement;
  const vars = [
    "--primary", "--accent", "--ring", "--glow",
    "--sidebar-primary", "--sidebar-ring",
  ];
  vars.forEach((v) => root.style.setProperty(v, t.hue));

  const parts = t.hue.split(" ");
  if (parts.length === 3) {
    root.style.setProperty("--sidebar-accent", `${parts[0]} 40% 15%`);
    root.style.setProperty("--sidebar-accent-foreground", `${parts[0]} 83% 80%`);
    root.style.setProperty("--glow-muted", `${parts[0]} 60% 45%`);
  }

  // Neon mode: boost contrast
  if (key === "neon-mode") {
    root.style.setProperty("--background", "0 0% 2%");
    root.style.setProperty("--card", "0 0% 4%");
    root.style.setProperty("--border", "120 50% 20%");
  } else {
    root.style.setProperty("--background", "240 10% 3.9%");
    root.style.setProperty("--card", "240 6% 6%");
    root.style.setProperty("--border", "240 4% 16%");
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem("membrance_theme");
    return (saved as ThemeKey) || "midnight-dark";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("membrance_theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeKey) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
