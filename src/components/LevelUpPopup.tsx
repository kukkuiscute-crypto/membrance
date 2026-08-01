import { motion, AnimatePresence } from "framer-motion";
import RankIcon from "@/components/RankIcon";

export interface LevelUpEvent {
  type: "rank" | "level";
  rank: string;
  level: number;
  color: string;
}

interface Props {
  event: LevelUpEvent | null;
  onClose: () => void;
}

/** Small diya / jyoti flame shown for a normal level-up. */
const Jyoti = ({ color, size = 46 }: { color: string; size?: number }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none">
    <defs>
      <radialGradient id="jyotiFlame" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stopColor="hsl(48 100% 92%)" />
        <stop offset="45%" stopColor="hsl(38 100% 62%)" />
        <stop offset="100%" stopColor={`hsl(${color})`} stopOpacity="0.35" />
      </radialGradient>
      <linearGradient id="jyotiBowl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(30 70% 62%)" />
        <stop offset="100%" stopColor="hsl(25 60% 32%)" />
      </linearGradient>
    </defs>
    <ellipse cx="20" cy="20" rx="12" ry="16" fill={`hsl(${color} / 0.18)`}>
      <animate attributeName="rx" values="10;14;10" dur="1.6s" repeatCount="indefinite" />
    </ellipse>
    <path d="M20 6c5 7 7 10 7 14a7 7 0 1 1-14 0c0-4 2-7 7-14z" fill="url(#jyotiFlame)">
      <animate attributeName="d"
        values="M20 6c5 7 7 10 7 14a7 7 0 1 1-14 0c0-4 2-7 7-14z;M20 4c6 8 7 11 7 15a7 7 0 1 1-14 0c0-4 1-7 7-15z;M20 6c5 7 7 10 7 14a7 7 0 1 1-14 0c0-4 2-7 7-14z"
        dur="0.9s" repeatCount="indefinite" />
    </path>
    <ellipse cx="20" cy="24" rx="2.6" ry="4" fill="hsl(0 0% 100% / 0.85)">
      <animate attributeName="ry" values="3;5;3" dur="0.7s" repeatCount="indefinite" />
    </ellipse>
    <path d="M8 34h24c0 6-5 9-12 9S8 40 8 34z" fill="url(#jyotiBowl)" />
    <path d="M8 34h24" stroke="hsl(35 80% 70%)" strokeWidth="1.4" />
  </svg>
);

const LevelUpPopup = ({ event, onClose }: Props) => (
  <AnimatePresence>
    {event && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      >
        {event.type === "rank" ? (
          <motion.div
            initial={{ scale: 0.4, y: 40, rotate: -8 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl px-10 py-12 text-center max-w-md w-full relative overflow-hidden"
            style={{ border: `2px solid hsl(${event.color} / 0.6)`, boxShadow: `0 0 80px hsl(${event.color} / 0.35)` }}
          >
            {/* Burst rays */}
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scaleY: 0, opacity: 0.9 }}
                animate={{ scaleY: 1, opacity: 0 }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.02, repeat: Infinity, repeatDelay: 1.2 }}
                className="absolute left-1/2 top-1/2 w-[2px] h-32 origin-top"
                style={{ background: `hsl(${event.color})`, transform: `rotate(${i * (360 / 14)}deg)` }}
              />
            ))}

            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                width: 150, height: 150,
                background: `hsl(${event.color} / 0.12)`,
                border: `2px solid hsl(${event.color} / 0.5)`,
                boxShadow: `0 0 60px hsl(${event.color} / 0.45)`,
              }}
            >
              <RankIcon rank={event.rank} color={event.color} size={110} />
            </motion.div>

            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">Rank Up</p>
            <h3 className="font-display text-4xl font-bold mb-2" style={{ color: `hsl(${event.color})` }}>{event.rank}</h3>
            <p className="text-sm text-muted-foreground mb-6">You reached level {event.level} of a brand new rank. Keep going!</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              Let's go
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 16, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl px-8 py-7 text-center max-w-xs w-full"
            style={{ border: `1px solid hsl(${event.color} / 0.45)` }}
          >
            <div className="flex justify-center mb-3"><Jyoti color={event.color} /></div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-1">Level Up</p>
            <h3 className="font-display text-xl font-bold text-foreground">
              {event.rank} <span style={{ color: `hsl(${event.color})` }}>Level {event.level}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-2">One more flame lit. Keep the streak alive.</p>
            <button onClick={onClose} className="mt-4 px-5 py-2 rounded-lg bg-secondary/70 text-foreground text-xs font-medium">Nice</button>
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

export default LevelUpPopup;
