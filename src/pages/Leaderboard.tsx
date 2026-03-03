import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const { user, isGuest, profile } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, username, points, rank, rank_level, grade")
      .order("points", { ascending: false })
      .limit(50);
    if (data) setLeaders(data);
    setLoading(false);
  };

  if (isGuest || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-xl p-12 text-center max-w-md">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Leaderboard Locked</h3>
          <p className="text-sm text-muted-foreground">Sign in to see the global leaderboard.</p>
        </div>
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const podiumIcons = [Crown, Medal, Medal];
  const podiumColors = ["45 93% 47%", "217 91% 75%", "25 60% 50%"];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Leaderboard</h2>
        <p className="text-sm text-muted-foreground">Top students worldwide</p>
      </div>

      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-8">
            {[1, 0, 2].map((idx) => {
              const l = topThree[idx];
              if (!l) return <div key={idx} className="w-28" />;
              const Icon = podiumIcons[idx];
              const color = podiumColors[idx];
              const height = idx === 0 ? "h-32" : idx === 1 ? "h-24" : "h-20";
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, hsl(${color} / 0.3), hsl(${color} / 0.1))`, border: `2px solid hsl(${color} / 0.5)` }}>
                    <Icon className="w-5 h-5" style={{ color: `hsl(${color})` }} />
                  </div>
                  <p className="text-sm font-bold text-foreground truncate w-28">{l.display_name || l.username || "Student"}</p>
                  <p className="text-xs text-primary font-medium">{l.points} PTS</p>
                  <div className={`${height} w-28 rounded-t-lg mt-2`}
                    style={{ background: `linear-gradient(180deg, hsl(${color} / 0.2), hsl(${color} / 0.05))`, border: `1px solid hsl(${color} / 0.3)` }}>
                    <div className="pt-3 text-center">
                      <span className="text-2xl font-display font-bold" style={{ color: `hsl(${color})` }}>#{idx + 1}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Rest */}
          <div className="space-y-2">
            {rest.map((l, i) => {
              const isMe = l.username === profile?.username && l.points === profile?.points;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isMe ? "glass neon-border-active glow-box" : "glass border border-border/20"}`}>
                  <span className="text-sm font-mono text-muted-foreground w-8 text-right">#{i + 4}</span>
                  <div className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{l.display_name || l.username || "Student"}</p>
                    <p className="text-xs text-muted-foreground">{l.rank} · {l.grade || "—"}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{l.points} PTS</span>
                  {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">You</span>}
                </motion.div>
              );
            })}
          </div>

          {leaders.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No one on the leaderboard yet. Start earning points!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
