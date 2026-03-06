import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Clock, ArrowRight, Layers, Trophy, PlayCircle, StickyNote, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface WorkstationProps {
  onFinishLesson: () => void;
}

const Workstation = ({ onFinishLesson }: WorkstationProps) => {
  const navigate = useNavigate();
  const { profile, isGuest, user } = useAuth();
  const grade = profile?.grade || (isGuest ? localStorage.getItem("membrance_profile") ? JSON.parse(localStorage.getItem("membrance_profile")!).grade : "Student" : "Student");
  const name = profile?.display_name || profile?.username || "Student";

  // Points cooldown: max 1 lesson finish per 5 minutes
  const [canFinish, setCanFinish] = useState(true);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    const lastFinish = localStorage.getItem("membrance_last_lesson_finish");
    if (lastFinish) {
      const elapsed = Date.now() - parseInt(lastFinish);
      const cooldown = 5 * 60 * 1000; // 5 minutes
      if (elapsed < cooldown) {
        setCanFinish(false);
        const remaining = Math.ceil((cooldown - elapsed) / 1000);
        setCooldownSec(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownSec <= 0) { setCanFinish(true); return; }
    const t = setTimeout(() => setCooldownSec(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSec]);

  const handleFinish = () => {
    if (!canFinish) return;
    localStorage.setItem("membrance_last_lesson_finish", Date.now().toString());
    setCanFinish(false);
    setCooldownSec(5 * 60);
    onFinishLesson();
  };

  // Build history-based quick stats
  const watchHistory = JSON.parse(localStorage.getItem("membrance_watch_history") || "[]");
  const searchHistory = JSON.parse(localStorage.getItem("membrance_search_history") || "[]");
  const recentSubject = watchHistory[0]?.title?.split(" ")[0] || "Algebra";
  const videosWatched = watchHistory.length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-10 max-w-2xl w-full glow-box relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">{grade}</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Welcome back, {name}
          </h2>
          <p className="text-muted-foreground text-base mb-8 max-w-md">
            {videosWatched > 0
              ? `You've watched ${videosWatched} videos. Keep going to climb the ranks!`
              : "Complete lessons to earn points and climb the ranks."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass rounded-xl p-4 neon-border">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Recent Topic</span>
              </div>
              <p className="font-display font-semibold text-foreground">{recentSubject} Basics</p>
            </div>
            <div className="glass rounded-xl p-4 neon-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Your Points</span>
              </div>
              <p className="font-display font-semibold text-foreground">{profile?.points ?? 0} pts</p>
            </div>
          </div>

          <motion.button
            whileHover={canFinish ? { scale: 1.02 } : {}}
            whileTap={canFinish ? { scale: 0.98 } : {}}
            onClick={handleFinish}
            disabled={!canFinish}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 text-base ${
              canFinish
                ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-box-strong"
                : "bg-secondary/60 text-muted-foreground cursor-not-allowed"
            }`}
          >
            {canFinish ? (
              <>
                <span>Finish Lesson (+10 pts)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Cooldown {Math.floor(cooldownSec / 60)}:{(cooldownSec % 60).toString().padStart(2, "0")}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full mt-6">
        {[
          { label: "Flashcards", count: "Study Cards", icon: Layers, path: "/dashboard/flashcards" },
          { label: "Video Hub", count: `${videosWatched} watched`, icon: PlayCircle, path: "/dashboard/videos" },
          { label: "Study Notes", count: "Your Desk", icon: StickyNote, path: "/dashboard/desk" },
          { label: "Olympiad Prep", count: "Coming Soon", icon: Trophy, path: "/dashboard/olympiads" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            onClick={() => navigate(item.path)}
            className="glass rounded-xl p-4 cursor-pointer hover:neon-border-active transition-all duration-200 group"
          >
            <item.icon className="w-6 h-6 text-primary mb-2" />
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.count}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Workstation;
