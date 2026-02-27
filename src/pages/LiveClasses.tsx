import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Users, Wifi } from "lucide-react";

const LiveClassesPage = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const target = new Date("2026-09-01").getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-12 max-w-lg w-full text-center glow-box relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6 neon-border-active">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Live Classes</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Interactive live streaming sessions with expert teachers are coming next semester.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 neon-border mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Scheduled for Next Semester</span>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { val: countdown.days, label: "Days" },
              { val: countdown.hours, label: "Hours" },
              { val: countdown.mins, label: "Minutes" },
            ].map((t) => (
              <div key={t.label} className="glass rounded-xl p-3 neon-border">
                <p className="font-display text-2xl font-bold text-foreground">{t.val}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>

          {/* Mock UI */}
          <div className="glass rounded-xl p-4 opacity-40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Stream Preview</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">0 viewers</span>
              </div>
            </div>
            <div className="w-full h-32 bg-secondary/60 rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Video Feed</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveClassesPage;
