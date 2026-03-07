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
import YourDeskPage from "@/pages/YourDesk";
import CommunitiesPage from "@/pages/Communities";
import LeaderboardPage from "@/pages/Leaderboard";
import ProfilePage from "@/pages/Profile";
import CalendarPlannerPage from "@/pages/CalendarPlanner";
import StudyTrackerPage from "@/pages/StudyTracker";
import StudyHelperPage from "@/pages/StudyHelper";
import TrinityPanel from "@/components/TrinityPanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Menu } from "lucide-react";

const Dashboard = () => {
  const { user, isGuest, profile } = useAuth();
  const points = profile?.points ?? (isGuest ? 0 : 10);

  const [justAdded, setJustAdded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addPoints = useCallback(async (amount: number) => {
    if (user && !isGuest) {
      const { data } = await supabase.from("profiles").select("points, monthly_points").eq("user_id", user.id).single();
      if (data) {
        await supabase.from("profiles").update({
          points: (data.points || 0) + amount,
          monthly_points: (data.monthly_points || 0) + amount,
        }).eq("user_id", user.id);
      }
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  }, [user, isGuest]);

  const handleFinishLesson = useCallback(() => addPoints(10), [addPoints]);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      <MouseGlow />
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => {
        if (window.innerWidth < 768) {
          setSidebarOpen(!sidebarOpen);
        } else {
          setSidebarCollapsed(!sidebarCollapsed);
        }
      }} />

      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        <header className="h-14 flex items-center justify-between px-6 border-b border-border/30 glass-strong shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => {
              if (window.innerWidth < 768) {
                setSidebarOpen(!sidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <ScoreDisplay score={points} justAdded={justAdded} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Workstation onFinishLesson={handleFinishLesson} />} />
            <Route path="flashcards" element={<FlashcardsPage onFlip={() => addPoints(5)} onMaster={() => addPoints(20)} />} />
            <Route path="videos" element={<VideoHubPage />} />
            <Route path="desk" element={<YourDeskPage />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="olympiads" element={<OlympiadsPage />} />
            <Route path="live" element={<LiveClassesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="calendar" element={<CalendarPlannerPage />} />
            <Route path="tracker" element={<StudyTrackerPage />} />
            <Route path="helper" element={<StudyHelperPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <TrinityPanel />
    </div>
  );
};

export default Dashboard;
