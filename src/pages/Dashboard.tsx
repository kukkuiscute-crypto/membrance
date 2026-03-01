import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MouseGlow from "@/components/MouseGlow";
import DashboardSidebar from "@/components/DashboardSidebar";
import ScoreDisplay from "@/components/ScoreDisplay";
import Workstation from "@/components/Workstation";
import FlashcardsPage from "@/pages/Flashcards";
import OlympiadsPage from "@/pages/Olympiads";
import LiveClassesPage from "@/pages/LiveClasses";
import SettingsPage from "@/pages/Settings";
import RankingsPage from "@/pages/Rankings";
import VideoHubPage from "@/pages/VideoHub";
import StudyNotesPage from "@/pages/StudyNotes";
import TrinityPanel from "@/components/TrinityPanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Menu } from "lucide-react";

const Dashboard = () => {
  const { user, isGuest, profile } = useAuth();
  const points = profile?.points ?? (isGuest ? 0 : 10);

  const [justAdded, setJustAdded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addPoints = useCallback(async (amount: number) => {
    if (user && !isGuest) {
      const { data } = await supabase
        .from("profiles")
        .select("points")
        .eq("user_id", user.id)
        .single();
      if (data) {
        await supabase
          .from("profiles")
          .update({ points: (data.points || 0) + amount })
          .eq("user_id", user.id);
      }
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  }, [user, isGuest]);

  const handleFinishLesson = useCallback(() => addPoints(10), [addPoints]);

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
            {/* Only show score for authenticated users */}
            {!isGuest && user && <ScoreDisplay score={points} justAdded={justAdded} />}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Workstation onFinishLesson={handleFinishLesson} />} />
            <Route path="flashcards" element={<FlashcardsPage onFlip={() => addPoints(5)} onMaster={() => addPoints(20)} />} />
            <Route path="videos" element={<VideoHubPage />} />
            <Route path="notes" element={<StudyNotesPage />} />
            <Route path="olympiads" element={<OlympiadsPage />} />
            <Route path="live" element={<LiveClassesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Trinity Panel */}
      <TrinityPanel />
    </div>
  );
};

export default Dashboard;
