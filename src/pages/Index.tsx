import { useState, useCallback } from "react";
import MouseGlow from "@/components/MouseGlow";
import DashboardSidebar from "@/components/DashboardSidebar";
import ScoreDisplay from "@/components/ScoreDisplay";
import Workstation from "@/components/Workstation";

const Index = () => {
  const [score, setScore] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const handleFinishLesson = useCallback(() => {
    setScore((prev) => prev + 10);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      <MouseGlow />

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border/30 glass-strong shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
          <ScoreDisplay score={score} justAdded={justAdded} />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Workstation onFinishLesson={handleFinishLesson} />
        </main>
      </div>
    </div>
  );
};

export default Index;
