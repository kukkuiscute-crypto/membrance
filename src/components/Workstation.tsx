import { motion } from "framer-motion";
import { Sparkles, BookOpen, Clock, ArrowRight, Layers, Trophy, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface WorkstationProps {
  onFinishLesson: () => void;
}

const Workstation = ({ onFinishLesson }: WorkstationProps) => {
  const navigate = useNavigate();
  const { profile, isGuest } = useAuth();
  const grade = profile?.grade || (isGuest ? localStorage.getItem("membrance_profile") ? JSON.parse(localStorage.getItem("membrance_profile")!).grade : "Student" : "Student");
  const name = profile?.display_name || "Student";

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
            Continue where you left off. Complete lessons to earn points and climb the ranks.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass rounded-xl p-4 neon-border">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Current Lesson</span>
              </div>
              <p className="font-display font-semibold text-foreground">Algebra Basics</p>
            </div>
            <div className="glass rounded-xl p-4 neon-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Est. Time</span>
              </div>
              <p className="font-display font-semibold text-foreground">15 minutes</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFinishLesson}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-colors duration-200 glow-box-strong text-base"
          >
            <span>Finish Lesson</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl w-full mt-6">
        {[
          { label: "Flashcards", count: "Study Cards", icon: Layers, path: "/dashboard/flashcards" },
          { label: "Olympiad Prep", count: "Coming Soon", icon: Trophy, path: "/dashboard/olympiads" },
          { label: "Live Class", count: "Coming Soon", icon: Video, path: "/dashboard/live" },
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
