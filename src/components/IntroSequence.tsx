import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSequenceProps {
  onComplete: () => void;
}

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  angle: number;
  distance: number;
}

const IntroSequence = ({ onComplete }: IntroSequenceProps) => {
  const [phase, setPhase] = useState<"orbs" | "absorb" | "flash" | "text" | "exit">("orbs");

  const generateOrbs = useCallback((): Orb[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.8,
      angle: (i / 20) * 360 + Math.random() * 30,
      distance: 150 + Math.random() * 250,
    }));
  }, []);

  const [orbs] = useState<Orb[]>(generateOrbs);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("absorb"), 1800);
    const t2 = setTimeout(() => setPhase("flash"), 3400);
    const t3 = setTimeout(() => setPhase("text"), 3700);
    const t4 = setTimeout(() => setPhase("exit"), 5500);
    const t5 = setTimeout(() => onComplete(), 6200);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-50 bg-[#09090b] flex items-center justify-center overflow-hidden"
        >
          {/* Orbiting small orbs */}
          {orbs.map((orb) => (
            <motion.div
              key={orb.id}
              className="absolute rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.3))`,
                boxShadow: `0 0 ${orb.size * 2}px hsl(var(--primary) / 0.5)`,
                left: "50%",
                top: "50%",
              }}
              initial={{
                x: Math.cos((orb.angle * Math.PI) / 180) * orb.distance,
                y: Math.sin((orb.angle * Math.PI) / 180) * orb.distance,
                opacity: 0,
                scale: 1,
              }}
              animate={
                phase === "orbs"
                  ? {
                      x: Math.cos((orb.angle * Math.PI) / 180) * orb.distance,
                      y: Math.sin((orb.angle * Math.PI) / 180) * orb.distance,
                      opacity: [0, 1, 0.7, 1],
                      rotate: [0, 360],
                      scale: [0, 1],
                    }
                  : phase === "absorb" || phase === "flash" || phase === "text"
                  ? {
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0,
                    }
                  : {}
              }
              transition={
                phase === "orbs"
                  ? {
                      opacity: { duration: 1, delay: orb.delay },
                      scale: { duration: 0.8, delay: orb.delay },
                      rotate: { duration: 4 + orb.delay * 2, repeat: Infinity, ease: "linear" },
                    }
                  : {
                      duration: 1.2 + orb.delay * 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }
              }
            />
          ))}

          {/* Central orb */}
          <motion.div
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary)), hsl(var(--primary) / 0.6))`,
              boxShadow: `0 0 60px hsl(var(--primary) / 0.6), 0 0 120px hsl(var(--primary) / 0.3)`,
            }}
            initial={{ width: 24, height: 24, opacity: 0 }}
            animate={
              phase === "orbs"
                ? { width: 24, height: 24, opacity: 1 }
                : phase === "absorb"
                ? { width: 48, height: 48, opacity: 1, boxShadow: `0 0 100px hsl(var(--primary) / 0.8), 0 0 200px hsl(var(--primary) / 0.4)` }
                : phase === "flash"
                ? { width: 3000, height: 3000, opacity: [1, 1, 0] }
                : { width: 0, height: 0, opacity: 0 }
            }
            transition={
              phase === "orbs"
                ? { duration: 0.6 }
                : phase === "absorb"
                ? { duration: 1.4, ease: "easeInOut" }
                : phase === "flash"
                ? { duration: 0.4, ease: "easeOut" }
                : { duration: 0.3 }
            }
          />

          {/* Lightning flash overlay */}
          <AnimatePresence>
            {phase === "flash" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.8, 1, 0] }}
                transition={{ duration: 0.4, times: [0, 0.1, 0.2, 0.3, 1] }}
                className="absolute inset-0 z-20"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary) / 0.9), white, hsl(var(--primary) / 0.7))`,
                }}
              />
            )}
          </AnimatePresence>

          {/* MEMBRANCE text */}
          <AnimatePresence>
            {phase === "text" && (
              <motion.div className="absolute z-30 flex flex-col items-center">
                <motion.h1
                  initial={{ opacity: 0, letterSpacing: "0em", scale: 1.5 }}
                  animate={{ opacity: 1, letterSpacing: "0.35em", scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="font-display text-5xl md:text-7xl font-bold text-foreground"
                  style={{
                    textShadow: `0 0 40px hsl(var(--primary) / 0.8), 0 0 80px hsl(var(--primary) / 0.4), 0 0 120px hsl(var(--primary) / 0.2)`,
                  }}
                >
                  MEMBRANCE
                </motion.h1>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 120, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-0.5 mt-3 rounded-full"
                  style={{ background: `hsl(var(--primary))` }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default IntroSequence;
