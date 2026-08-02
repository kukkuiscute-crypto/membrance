import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeKey =
  | "midnight-dark"
  | "sakura-pink"
  | "famous-indigo"
  | "neon-mode"
  | "ocean-deep"
  | "cyber-violet"
  | "ruby-flame"
  | "arctic-frost"
  | "ember-glow"
  | "forest-moss"
  | "galaxy-purple"
  | "solar-flare"
  | "midnight-rose"
  | "emerald-mint"
  | "crimson-night"
  | "lavender-dream"
  | "tangerine-pop"
  | "deep-space"
  | "neon-pink"
  | "honey-amber"
  | "icy-mint"
  | "royal-plum"
  // New themes
  | "aurora-borealis"
  | "sunset-coral"
  | "midnight-cyan"
  | "peachy-cream"
  | "vaporwave"
  | "matrix-green"
  | "blood-moon"
  | "sapphire-tide"
  | "molten-copper"
  | "cotton-candy"
  | "electric-lime"
  | "cherry-blossom"
  | "obsidian-flame"
  | "arctic-aurora"
  | "royal-gold"
  | "midnight-lilac"
  | "cosmic-teal"
  | "phantom-magenta"
  | "jade-imperial"
  | "sunrise-mango"
  | "twilight-orchid"
  | "steel-azure"
  | "toxic-slime"
  | "rose-quartz"
  | "abyss-violet"
  // Alpha 2.0 themes
  | "chalkboard-green"
  | "nebula-rose"
  | "arcade-cyan"
  | "sunflower-field"
  | "deep-ocean-teal"
  | "midnight-ember"
  | "glacier-blue"
  | "plasma-purple"
  | "candy-apple"
  | "moss-stone"
  | "solar-eclipse"
  | "bubblegum-blue"
  | "amber-dusk"
  | "ultraviolet"
  | "spring-leaf"
  | "crimson-gold";

export const THEMES: { key: ThemeKey; label: string; hue: string }[] = [
  { key: "midnight-dark", label: "Midnight Dark", hue: "262 83% 65%" },
  { key: "sakura-pink", label: "Sakura Pink", hue: "330 70% 65%" },
  { key: "famous-indigo", label: "Famous Indigo", hue: "240 70% 55%" },
  { key: "neon-mode", label: "Neon Mode", hue: "120 100% 50%" },
  { key: "ocean-deep", label: "Ocean Deep", hue: "195 85% 45%" },
  { key: "cyber-violet", label: "Cyber Violet", hue: "280 90% 60%" },
  { key: "ruby-flame", label: "Ruby Flame", hue: "0 85% 55%" },
  { key: "arctic-frost", label: "Arctic Frost", hue: "200 60% 70%" },
  { key: "ember-glow", label: "Ember Glow", hue: "20 90% 50%" },
  { key: "forest-moss", label: "Forest Moss", hue: "120 45% 35%" },
  { key: "galaxy-purple", label: "Galaxy Purple", hue: "270 75% 55%" },
  { key: "solar-flare", label: "Solar Flare", hue: "40 100% 55%" },
  { key: "midnight-rose", label: "Midnight Rose", hue: "340 75% 55%" },
  { key: "emerald-mint", label: "Emerald Mint", hue: "160 70% 45%" },
  { key: "crimson-night", label: "Crimson Night", hue: "350 90% 50%" },
  { key: "lavender-dream", label: "Lavender Dream", hue: "260 60% 70%" },
  { key: "tangerine-pop", label: "Tangerine Pop", hue: "25 95% 55%" },
  { key: "deep-space", label: "Deep Space", hue: "230 80% 55%" },
  { key: "neon-pink", label: "Neon Pink", hue: "320 100% 60%" },
  { key: "honey-amber", label: "Honey Amber", hue: "38 90% 50%" },
  { key: "icy-mint", label: "Icy Mint", hue: "170 80% 60%" },
  { key: "royal-plum", label: "Royal Plum", hue: "295 65% 45%" },
  { key: "aurora-borealis", label: "Aurora Borealis", hue: "155 85% 50%" },
  { key: "sunset-coral", label: "Sunset Coral", hue: "12 88% 62%" },
  { key: "midnight-cyan", label: "Midnight Cyan", hue: "185 90% 50%" },
  { key: "peachy-cream", label: "Peachy Cream", hue: "28 85% 68%" },
  { key: "vaporwave", label: "Vaporwave", hue: "290 95% 65%" },
  { key: "matrix-green", label: "Matrix Green", hue: "125 95% 45%" },
  { key: "blood-moon", label: "Blood Moon", hue: "358 78% 42%" },
  { key: "sapphire-tide", label: "Sapphire Tide", hue: "210 95% 55%" },
  { key: "molten-copper", label: "Molten Copper", hue: "18 82% 48%" },
  { key: "cotton-candy", label: "Cotton Candy", hue: "310 80% 72%" },
  { key: "electric-lime", label: "Electric Lime", hue: "75 100% 55%" },
  { key: "cherry-blossom", label: "Cherry Blossom", hue: "345 85% 70%" },
  { key: "obsidian-flame", label: "Obsidian Flame", hue: "8 92% 50%" },
  { key: "arctic-aurora", label: "Arctic Aurora", hue: "180 75% 55%" },
  { key: "royal-gold", label: "Royal Gold", hue: "42 95% 55%" },
  { key: "midnight-lilac", label: "Midnight Lilac", hue: "275 65% 68%" },
  { key: "cosmic-teal", label: "Cosmic Teal", hue: "170 85% 40%" },
  { key: "phantom-magenta", label: "Phantom Magenta", hue: "305 90% 55%" },
  { key: "jade-imperial", label: "Jade Imperial", hue: "150 65% 40%" },
  { key: "sunrise-mango", label: "Sunrise Mango", hue: "35 100% 58%" },
  { key: "twilight-orchid", label: "Twilight Orchid", hue: "285 70% 60%" },
  { key: "steel-azure", label: "Steel Azure", hue: "215 55% 55%" },
  { key: "toxic-slime", label: "Toxic Slime", hue: "90 100% 50%" },
  { key: "rose-quartz", label: "Rose Quartz", hue: "355 75% 72%" },
  { key: "abyss-violet", label: "Abyss Violet", hue: "255 85% 50%" },
  { key: "chalkboard-green", label: "Chalkboard Green", hue: "152 55% 42%" },
  { key: "nebula-rose", label: "Nebula Rose", hue: "335 88% 62%" },
  { key: "arcade-cyan", label: "Arcade Cyan", hue: "188 100% 52%" },
  { key: "sunflower-field", label: "Sunflower Field", hue: "48 98% 55%" },
  { key: "deep-ocean-teal", label: "Deep Ocean Teal", hue: "192 70% 38%" },
  { key: "midnight-ember", label: "Midnight Ember", hue: "15 88% 55%" },
  { key: "glacier-blue", label: "Glacier Blue", hue: "205 80% 66%" },
  { key: "plasma-purple", label: "Plasma Purple", hue: "268 95% 62%" },
  { key: "candy-apple", label: "Candy Apple", hue: "352 92% 56%" },
  { key: "moss-stone", label: "Moss Stone", hue: "108 40% 45%" },
  { key: "solar-eclipse", label: "Solar Eclipse", hue: "30 95% 60%" },
  { key: "bubblegum-blue", label: "Bubblegum Blue", hue: "222 92% 68%" },
  { key: "amber-dusk", label: "Amber Dusk", hue: "36 92% 52%" },
  { key: "ultraviolet", label: "Ultraviolet", hue: "248 96% 66%" },
  { key: "spring-leaf", label: "Spring Leaf", hue: "138 70% 48%" },
  { key: "crimson-gold", label: "Crimson Gold", hue: "8 85% 58%" },
];

export type AppearanceMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  appearance: AppearanceMode;
  setAppearance: (m: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "midnight-dark",
  setTheme: () => {},
  appearance: "dark",
  setAppearance: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function applyTheme(key: ThemeKey, mode: AppearanceMode) {
  const t = THEMES.find((th) => th.key === key) || THEMES[0];
  const root = document.documentElement;
  const vars = [
    "--primary", "--accent", "--ring", "--glow",
    "--sidebar-primary", "--sidebar-ring",
  ];
  vars.forEach((v) => root.style.setProperty(v, t.hue));

  const parts = t.hue.split(" ");
  if (parts.length === 3) {
    root.style.setProperty("--glow-muted", `${parts[0]} 60% 45%`);
  }

  if (mode === "light") {
    root.style.setProperty("--background", "0 0% 98%");
    root.style.setProperty("--foreground", "240 10% 10%");
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", "240 10% 10%");
    root.style.setProperty("--popover", "0 0% 100%");
    root.style.setProperty("--popover-foreground", "240 10% 10%");
    root.style.setProperty("--secondary", "240 5% 92%");
    root.style.setProperty("--secondary-foreground", "240 6% 25%");
    root.style.setProperty("--muted", "240 5% 92%");
    root.style.setProperty("--muted-foreground", "240 4% 46%");
    root.style.setProperty("--border", "240 6% 85%");
    root.style.setProperty("--input", "240 6% 85%");
    root.style.setProperty("--surface-glass", "0 0% 97%");
    root.style.setProperty("--sidebar-background", "0 0% 97%");
    root.style.setProperty("--sidebar-foreground", "240 6% 30%");
    root.style.setProperty("--sidebar-border", "240 6% 90%");
    if (parts.length === 3) {
      root.style.setProperty("--sidebar-accent", `${parts[0]} 30% 93%`);
      root.style.setProperty("--sidebar-accent-foreground", `${parts[0]} 70% 40%`);
    }
  } else {
    // Dark mode defaults
    if (key === "neon-mode") {
      root.style.setProperty("--background", "0 0% 2%");
      root.style.setProperty("--card", "0 0% 4%");
      root.style.setProperty("--border", "120 50% 20%");
    } else {
      root.style.setProperty("--background", "240 10% 3.9%");
      root.style.setProperty("--card", "240 6% 6%");
      root.style.setProperty("--border", "240 4% 16%");
    }
    root.style.setProperty("--foreground", "0 0% 95%");
    root.style.setProperty("--card-foreground", "0 0% 95%");
    root.style.setProperty("--popover", "240 6% 6%");
    root.style.setProperty("--popover-foreground", "0 0% 95%");
    root.style.setProperty("--secondary", "240 5% 12%");
    root.style.setProperty("--secondary-foreground", "0 0% 85%");
    root.style.setProperty("--muted", "240 4% 16%");
    root.style.setProperty("--muted-foreground", "240 5% 55%");
    root.style.setProperty("--input", "240 4% 16%");
    root.style.setProperty("--surface-glass", "240 6% 8%");
    root.style.setProperty("--sidebar-background", "240 8% 5%");
    root.style.setProperty("--sidebar-foreground", "0 0% 75%");
    root.style.setProperty("--sidebar-border", "240 4% 12%");
    if (parts.length === 3) {
      root.style.setProperty("--sidebar-accent", `${parts[0]} 40% 15%`);
      root.style.setProperty("--sidebar-accent-foreground", `${parts[0]} 83% 80%`);
    }
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem("membrance_theme");
    // Migrate away from removed old midnight-* themes
    if (saved && THEMES.some((t) => t.key === saved)) return saved as ThemeKey;
    return "midnight-dark";
  });

  const [appearance, setAppearanceState] = useState<AppearanceMode>(() => {
    return (localStorage.getItem("membrance_appearance") as AppearanceMode) || "dark";
  });

  useEffect(() => {
    applyTheme(theme, appearance);
    localStorage.setItem("membrance_theme", theme);
  }, [theme, appearance]);

  const setTheme = (t: ThemeKey) => setThemeState(t);
  const setAppearance = (m: AppearanceMode) => {
    setAppearanceState(m);
    localStorage.setItem("membrance_appearance", m);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, appearance, setAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
};
