import { motion } from "framer-motion";
import { getRankInfo } from "@/lib/ranks";
import RankIcon from "@/components/RankIcon";

interface RankBadgeProps {
  points: number;
  compact?: boolean;
  /** Bigger hero treatment for the Rankings page */
  large?: boolean;
}

const RankBadge = ({ points, compact = false, large = false }: RankBadgeProps) => {
  const info = getRankInfo(points);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `hsl(${info.color} / 0.18)`, border: `1px solid hsl(${info.color} / 0.5)` }}
        >
          <RankIcon rank={info.rank} color={info.color} size={18} />
        </div>
        <span className="text-xs font-medium" style={{ color: `hsl(${info.color})` }}>
          {info.rank} {info.level}
        </span>
      </div>
    );
  }

  const iconSize = large ? 92 : 40;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-2xl relative overflow-hidden ${large ? "p-8" : "p-4"} ${info.isElite ? "neon-border-animated" : ""}`}
      style={{ borderColor: `hsl(${info.color} / 0.45)`, borderWidth: info.isElite ? 2 : 1 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 20% 0%, hsl(${info.color} / 0.16), transparent 60%)` }}
      />

      <div className={`relative flex items-center ${large ? "gap-6 mb-6" : "gap-3 mb-3"}`}>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: iconSize + (large ? 40 : 12),
            height: iconSize + (large ? 40 : 12),
            backgroundColor: `hsl(${info.color} / 0.14)`,
            border: `2px solid hsl(${info.color} / 0.55)`,
            boxShadow: `0 0 ${large ? 44 : 16}px hsl(${info.color} / 0.35)`,
          }}
        >
          <RankIcon rank={info.rank} color={info.color} size={iconSize} />
        </motion.div>

        <div className="min-w-0">
          <p
            className={`font-display font-bold tracking-wide ${large ? "text-4xl" : "text-sm"}`}
            style={{ color: `hsl(${info.color})` }}
          >
            {info.rank}
          </p>
          <p className={`text-muted-foreground ${large ? "text-base mt-1" : "text-xs"}`}>
            Level {info.level} / {info.maxLevels}
            {info.isElite && <span className="ml-2 text-xs uppercase tracking-widest opacity-80">Elite</span>}
          </p>
          {large && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold text-foreground">{info.totalPoints}</span> total points
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className={`w-full rounded-full bg-secondary overflow-hidden ${large ? "h-3" : "h-1.5"}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${info.progress}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: `hsl(${info.color})`, boxShadow: `0 0 12px hsl(${info.color} / 0.7)` }}
        />
      </div>
      <p className={`text-muted-foreground mt-2 ${large ? "text-sm" : "text-xs"}`}>
        {large ? `${Math.round(info.progress)}% into level ${info.level}` : `${info.totalPoints} points total`}
      </p>
    </motion.div>
  );
};

export default RankBadge;
