import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Laptop, Microscope, FlaskConical, Monitor, GraduationCap, Atom, Globe, Calculator, Lightbulb, Pencil, Brain, BookOpen, Ruler, Compass, Telescope, Beaker, Cpu, Dna, Rocket } from "lucide-react";

interface IntroSequenceProps {
  onComplete: () => void;
}

const ICONS = [
  Book, Laptop, Microscope, FlaskConical, Monitor, GraduationCap,
  Atom, Globe, Calculator, Lightbulb, Pencil, Brain, BookOpen,
  Ruler, Compass, Telescope, Beaker, Cpu, Dna, Rocket,
];

const QUOTES = [
  "Education is the most powerful weapon which you can use to change the world.",
  "The beautiful thing about learning is that nobody can take it away from you.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "The mind is not a vessel to be filled, but a fire to be kindled.",
  "An investment in knowledge pays the best interest.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Knowledge is power. Information is liberating.",
  "The expert in anything was once a beginner.",
  "Study hard, for the well is deep, and our brains are shallow.",
];

interface Orb {
  id: number;
  size: number;
  delay: number;
  angle: number;
  distance: number;
  Icon: typeof Book;
}

const IntroSequence = ({ onComplete }: IntroSequenceProps) => {
  const [phase, setPhase] = useState<"orbs" | "absorb" | "flash" | "text" | "exit">("orbs");
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const generateOrbs = useCallback((): Orb[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 20 + Math.random() * 16,
      delay: Math.random() * 0.8,
      angle: (i / 20) * 360 + Math.random() * 30,
      distance: 140 + Math.random() * 220,
      Icon: ICONS[i % ICONS.length],
    }));
  }, []);

  const [orbs] = useState<Orb[]>(generateOrbs);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("absorb"), 2000);
    const t2 = setTimeout(() => setPhase("flash"), 3600);
    const t3 = setTimeout(() => setPhase("text"), 3900);
    const t4 = setTimeout(() => setPhase("exit"), 5800);
    const t5 = setTimeout(() => onComplete(), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#050505" }}
        >
          {/* Gravity well */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300, height: 300,
              background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
              willChange: "transform, opacity",
            }}
            animate={
              phase === "absorb"
                ? { scale: [1, 1.8, 0.5], opacity: [0.3, 0.6, 0] }
                : { scale: [0.8, 1.1, 0.8], opacity: [0.1, 0.2, 0.1] }
            }
            transition={
              phase === "absorb"
                ? { duration: 1.6, ease: "easeInOut" }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
          />

          {/* Orbs */}
          {orbs.map((orb) => {
            const IconComp = orb.Icon;
            return (
              <motion.div
                key={orb.id}
                className="absolute flex items-center justify-center"
                style={{
                  width: orb.size + 12, height: orb.size + 12,
                  left: "50%", top: "50%",
                  willChange: "transform, opacity",
                  contain: "layout style paint",
                }}
                initial={{
                  x: Math.cos((orb.angle * Math.PI) / 180) * orb.distance,
                  y: Math.sin((orb.angle * Math.PI) / 180) * orb.distance,
                  opacity: 0, scale: 0, rotate: 0,
                }}
                animate={
                  phase === "orbs"
                    ? {
                        x: Math.cos((orb.angle * Math.PI) / 180) * orb.distance,
                        y: Math.sin((orb.angle * Math.PI) / 180) * orb.distance,
                        opacity: [0, 0.9, 0.6, 0.9], scale: [0, 1.1, 0.95, 1], rotate: [0, 360],
                      }
                    : { x: 0, y: 0, opacity: 0, scale: 0, rotate: 720 }
                }
                transition={
                  phase === "orbs"
                    ? {
                        opacity: { duration: 1.2, delay: orb.delay },
                        scale: { duration: 0.8, delay: orb.delay },
                        rotate: { duration: 6 + orb.delay * 3, repeat: Infinity, ease: "linear" },
                      }
                    : { duration: 1.0 + orb.delay * 0.4, ease: [0.4, 0, 0.2, 1] }
                }
              >
                <IconComp className="text-primary" style={{ width: orb.size, height: orb.size, opacity: 0.85 }} />
              </motion.div>
            );
          })}

          {/* Central orb */}
          <motion.div
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary)), hsl(var(--primary) / 0.4))`,
              boxShadow: `0 0 60px hsl(var(--primary) / 0.6), 0 0 120px hsl(var(--primary) / 0.3)`,
              willChange: "transform, opacity, width, height",
            }}
            initial={{ width: 16, height: 16, opacity: 0 }}
            animate={
              phase === "orbs" ? { width: 20, height: 20, opacity: [0, 1], scale: [0.8, 1.1, 1] }
              : phase === "absorb" ? { width: 60, height: 60, opacity: 1 }
              : phase === "flash" ? { width: 4000, height: 4000, opacity: [1, 1, 0] }
              : { width: 0, height: 0, opacity: 0 }
            }
            transition={
              phase === "orbs" ? { duration: 0.8, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
              : phase === "absorb" ? { duration: 1.4, ease: "easeInOut" }
              : phase === "flash" ? { duration: 0.35, ease: "easeOut" }
              : { duration: 0.2 }
            }
          />

          {/* Flash */}
          <AnimatePresence>
            {phase === "flash" && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6, 1, 0] }}
                  transition={{ duration: 0.4, times: [0, 0.08, 0.15, 0.25, 1] }}
                  className="absolute inset-0 z-20"
                  style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.8), white 40%, white 60%, hsl(var(--primary) / 0.6))` }}
                />
                <motion.svg className="absolute z-25 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 0.3 }}>
                  <motion.path d="M 20 0 L 55 40 L 40 42 L 80 100" fill="none" stroke="white" strokeWidth="0.8"
                    style={{ filter: "drop-shadow(0 0 8px white)" }} />
                </motion.svg>
              </>
            )}
          </AnimatePresence>

          {/* Text + Quote */}
          <AnimatePresence>
            {phase === "text" && (
              <motion.div className="absolute z-30 flex flex-col items-center px-4">
                <motion.h1
                  initial={{ opacity: 0, letterSpacing: "0em", scale: 1.6, y: 10 }}
                  animate={{ opacity: 1, letterSpacing: "0.4em", scale: 1, y: 0 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="font-display text-5xl md:text-7xl font-bold text-foreground"
                  style={{ textShadow: `0 0 40px hsl(var(--primary) / 0.9), 0 0 80px hsl(var(--primary) / 0.5)` }}
                >
                  MEMBRANCE
                </motion.h1>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 140, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-0.5 mt-4 rounded-full"
                  style={{ background: `hsl(var(--primary))` }}
                />
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-sm text-muted-foreground mt-4 max-w-md text-center italic leading-relaxed"
                >
                  "{quote}"
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default IntroSequence;
