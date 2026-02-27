import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MouseGlow from "@/components/MouseGlow";
import DashboardSidebar from "@/components/DashboardSidebar";
import ScoreDisplay from "@/components/ScoreDisplay";
import Workstation from "@/components/Workstation";
import FlashcardsPage from "@/pages/Flashcards";
import OlympiadsPage from "@/pages/Olympiads";
import LiveClassesPage from "@/pages/LiveClasses";
import { Menu } from "lucide-react";

const Dashboard = () => {
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem("membrance_xp");
    return saved ? parseInt(saved) : 0;
  });
  const [justAdded, setJustAdded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addXP = useCallback((amount: number) => {
    setScore((prev) => {
      const newScore = prev + amount;
      localStorage.setItem("membrance_xp", String(newScore));
      return newScore;
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  }, []);

  const handleFinishLesson = useCallback(() => addXP(10), [addXP]);

  const level = Math.floor(score / 1000) + 1;
  const xpInLevel = score % 1000;
  const xpProgress = (xpInLevel / 1000) * 100;

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      <MouseGlow />

      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/30 glass-strong shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Level indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Lv.{level}</span>
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <ScoreDisplay score={score} justAdded={justAdded} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Workstation onFinishLesson={handleFinishLesson} />} />
            <Route path="flashcards" element={<FlashcardsPage onFlip={() => addXP(5)} onMaster={() => addXP(20)} />} />
            <Route path="olympiads" element={<OlympiadsPage />} />
            <Route path="live" element={<LiveClassesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
