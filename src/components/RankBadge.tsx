import { motion } from "framer-motion";
import { getRankInfo } from "@/lib/ranks";
import { Shield } from "lucide-react";

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
          <Shield className="w-3 h-3" style={{ color: `hsl(${info.color})` }} />
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
      className={`glass rounded-xl p-4 relative overflow-hidden ${info.isFutureSelf ? "animate-pulse-glow" : ""}`}
      style={{ borderColor: `hsl(${info.color} / 0.4)`, borderWidth: info.isFutureSelf ? 2 : 1 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `hsl(${info.color} / 0.2)`, border: `2px solid hsl(${info.color} / 0.6)` }}
        >
          <Shield className="w-5 h-5" style={{ color: `hsl(${info.color})` }} />
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
