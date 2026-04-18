import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// GitHub Pages SPA: restore deep-link path saved by public/404.html
try {
  const saved = sessionStorage.getItem("membrance_redirect");
  if (saved) {
    sessionStorage.removeItem("membrance_redirect");
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    window.history.replaceState(null, "", base + saved);
  }
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
