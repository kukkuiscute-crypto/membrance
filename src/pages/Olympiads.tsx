import { motion } from "framer-motion";
import { Trophy, Clock, Lock } from "lucide-react";

const OlympiadsPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-12 max-w-lg w-full text-center glow-box relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6 neon-border-active">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Olympiad Preparation</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Competitive testing modules for Grade 7/8 Math and Science are being crafted by our team.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 neon-border mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Release: Winter 2026</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {["Math Challenge", "Science Bowl", "Logic Puzzles", "Speed Rounds"].map((item) => (
              <div key={item} className="glass rounded-xl p-4 flex items-center gap-2 opacity-50">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OlympiadsPage;
