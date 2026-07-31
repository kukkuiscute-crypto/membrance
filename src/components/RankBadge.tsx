import { motion } from "framer-motion";
import { getRankInfo } from "@/lib/ranks";
import RankIcon from "@/components/RankIcon";

interface RankBadgeProps {
  points: number;
  compact?: boolean;
}

const RankBadge = ({ points, compact = false }: RankBadgeProps) => {
  const info = getRankInfo(points);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `hsl(${info.color} / 0.2)`, border: `1px solid hsl(${info.color} / 0.5)` }}
        >
          <RankIcon rank={info.rank} color={info.color} size={14} />
        </div>
        <span className="text-xs font-medium" style={{ color: `hsl(${info.color})` }}>
          {info.rank} {info.level}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-xl p-4 relative overflow-hidden ${info.isElite ? "neon-border-animated" : ""}`}
      style={{ borderColor: `hsl(${info.color} / 0.4)`, borderWidth: info.isElite ? 2 : 1 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `hsl(${info.color} / 0.2)`, border: `2px solid hsl(${info.color} / 0.6)` }}
        >
          <RankIcon rank={info.rank} color={info.color} size={24} />
        </div>
        <div>
          <p className="font-display font-bold text-sm" style={{ color: `hsl(${info.color})` }}>{info.rank}</p>
          <p className="text-xs text-muted-foreground">
            Level {info.level} / {info.maxLevels}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${info.progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: `hsl(${info.color})` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{info.totalPoints} points total</p>
    </motion.div>
  );
};

export default RankBadge;
