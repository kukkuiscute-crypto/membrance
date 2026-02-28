import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import RankBadge from "@/components/RankBadge";
import { RANKS } from "@/lib/ranks";
import { Shield, Lock } from "lucide-react";

const Rankings = () => {
  const { user, isGuest, profile } = useAuth();

  if (isGuest || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-xl p-12 text-center max-w-md">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Rankings Locked</h3>
          <p className="text-sm text-muted-foreground">Sign in with Google to unlock the ranking system and compete with students worldwide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Rankings</h2>
        <p className="text-sm text-muted-foreground">Your progression through the ranks</p>
      </div>

      {/* Current rank */}
      <RankBadge points={profile?.points || 0} />

      {/* All ranks */}
      <div className="space-y-2">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Ranks</h3>
        <div className="grid gap-2">
          {RANKS.map((rank, i) => {
            const current = profile?.points >= rank.minPoints;
            const isFutureSelf = rank.name === "Future Self";
            return (
              <motion.div
                key={rank.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  current ? "glass neon-border" : "bg-secondary/20 opacity-50"
                }`}
                style={current ? { borderColor: `hsl(${rank.color} / 0.4)` } : {}}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `hsl(${rank.color} / ${current ? 0.2 : 0.05})`,
                    border: `1px solid hsl(${rank.color} / ${current ? 0.5 : 0.15})`,
                  }}
                >
                  <Shield className="w-4 h-4" style={{ color: `hsl(${rank.color})` }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: current ? `hsl(${rank.color})` : undefined }}>
                    {rank.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isFutureSelf ? "3 Elite Levels" : "7 Levels"} · {rank.minPoints}+ pts
                  </p>
                </div>
                {current && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">Unlocked</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Rankings;
