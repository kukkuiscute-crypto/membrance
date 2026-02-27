import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSequenceProps {
  onComplete: () => void;
}

const IntroSequence = ({ onComplete }: IntroSequenceProps) => {
  const [phase, setPhase] = useState<"dot" | "text" | "exit">("dot");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 1200);
    const t2 = setTimeout(() => setPhase("exit"), 3200);
    const t3 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 bg-background flex items-center justify-center"
        >
          {/* Pulsing dot */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: phase === "text" ? 40 : 1, opacity: phase === "text" ? 0 : 1 }}
            transition={{ duration: phase === "text" ? 1 : 0.5, ease: "easeOut" }}
            className="absolute w-3 h-3 rounded-full bg-primary glow-box-strong"
          />

          {/* Logo text */}
          <AnimatePresence>
            {phase === "text" && (
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0em" }}
                animate={{ opacity: 1, letterSpacing: "0.35em" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="font-display text-4xl md:text-6xl font-bold text-foreground glow-text relative z-10"
              >
                MEMBRANCE
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default IntroSequence;
