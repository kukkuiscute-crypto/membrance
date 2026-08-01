import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import RankBadge from "@/components/RankBadge";
import { RANKS, RANK_RULES, getRankInfo } from "@/lib/ranks";
import RankIcon from "@/components/RankIcon";
import LevelUpPopup, { LevelUpEvent } from "@/components/LevelUpPopup";
import { Lock, Sparkles } from "lucide-react";

const STORE_KEY = "membrance-rank-progress";

const Rankings = () => {
  const { user, isGuest, profile } = useAuth();
  const points = profile?.points || 0;
  const info = getRankInfo(points);
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);

  // Level-up / rank-up popup fires only when the Rankings page is opened.
  useEffect(() => {
    if (!user || isGuest || !profile) return;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const prev = raw ? JSON.parse(raw) as { rank: string; level: number } : null;
      if (prev && (prev.rank !== info.rank || prev.level !== info.level)) {
        const rankedUp = prev.rank !== info.rank;
        setLevelUp({ type: rankedUp ? "rank" : "level", rank: info.rank, level: info.level, color: info.color });
      }
      localStorage.setItem(STORE_KEY, JSON.stringify({ rank: info.rank, level: info.level }));
    } catch { /* storage unavailable */ }
  }, [user, isGuest, profile, info.rank, info.level, info.color]);

  if (isGuest || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-xl p-12 text-center max-w-md">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Rankings Locked</h3>
          <p className="text-sm text-muted-foreground">Sign in to unlock the ranking system and compete with students worldwide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <LevelUpPopup event={levelUp} onClose={() => setLevelUp(null)} />

      <div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient">Rankings</h2>
        <p className="text-sm text-muted-foreground mt-1">Your progression through the ten tiers of Membrance</p>
      </div>

      <RankBadge points={points} large />

      {/* Progression rules */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Progression Rules
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {RANK_RULES.map((rule, i) => (
            <motion.div key={rule.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 hover-lift">
              <p className="text-sm font-semibold text-foreground mb-1">{rule.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All ranks */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">All Ranks</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {RANKS.map((rank, i) => {
            const unlocked = points >= rank.minPoints;
            const isCurrent = info.rank === rank.name;
            const isElite = rank.name === "Super League";
            return (
              <motion.div
                key={rank.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  unlocked ? "glass hover-lift" : "bg-secondary/20 opacity-60"
                } ${isCurrent ? "ring-2" : ""}`}
                style={{
                  borderColor: unlocked ? `hsl(${rank.color} / 0.4)` : undefined,
                  ...(isCurrent ? { ["--tw-ring-color" as string]: `hsl(${rank.color} / 0.55)` } : {}),
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `hsl(${rank.color} / ${unlocked ? 0.16 : 0.05})`,
                    border: `1px solid hsl(${rank.color} / ${unlocked ? 0.5 : 0.15})`,
                    boxShadow: unlocked ? `0 0 22px hsl(${rank.color} / 0.28)` : undefined,
                  }}
                >
                  <RankIcon rank={rank.name} color={rank.color} size={44} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-display font-bold" style={{ color: unlocked ? `hsl(${rank.color})` : undefined }}>
                    {rank.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isElite ? "3 Elite Levels" : "7 Levels"} · {rank.minPoints}+ pts
                  </p>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/20 text-primary font-semibold uppercase tracking-wider">Current</span>
                ) : unlocked ? (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/60 text-muted-foreground font-medium">Unlocked</span>
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
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
