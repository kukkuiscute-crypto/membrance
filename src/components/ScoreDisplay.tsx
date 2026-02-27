import { motion, AnimatePresence } from "framer-motion";
import { Circle } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  justAdded: boolean;
}

const ScoreDisplay = ({ score, justAdded }: ScoreDisplayProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`w-8 h-8 rounded-full bg-primary/20 neon-border flex items-center justify-center transition-all duration-300 ${justAdded ? "animate-pulse-glow" : ""}`}>
          <Circle className="w-4 h-4 text-primary fill-primary" />
        </div>
        <AnimatePresence>
          {justAdded && (
            <motion.span
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-2 -right-2 text-xs font-bold text-primary"
            >
              +10
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
        <motion.p
          key={score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-lg font-display font-bold text-foreground"
        >
          {score} <span className="text-primary text-sm">PTS</span>
        </motion.p>
      </div>
    </div>
  );
};

export default ScoreDisplay;
