import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useCallback } from "react";
import IntroSequence from "@/components/IntroSequence";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AccountHub from "./pages/AccountHub";
import NotFound from "./pages/NotFound";
import HelperBot from "./components/HelperBot";

const queryClient = new QueryClient();

const AppContent = () => {
  // Only show the cinematic intro once per browser session
  const [introComplete, setIntroComplete] = useState(() => {
    try { return sessionStorage.getItem("membrance_intro_seen") === "1"; } catch { return false; }
  });
  const handleIntroComplete = useCallback(() => {
    try { sessionStorage.setItem("membrance_intro_seen", "1"); } catch {}
    setIntroComplete(true);
  }, []);

  return (
    <>
      {!introComplete && <IntroSequence onComplete={handleIntroComplete} />}
      <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/accounts" element={<AccountHub />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <HelperBot currentPage={window.location.pathname.includes("auth") ? "auth" : window.location.pathname.includes("video") ? "videohub" : "dashboard"} />
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
