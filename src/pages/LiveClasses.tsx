import { motion } from "framer-motion";
import { Video, Hammer, Users, Wifi } from "lucide-react";

const LiveClassesPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-card p-12 max-w-lg w-full text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6 neon-border-active">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gradient mb-2">Live Classes</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Interactive live streaming sessions with expert teachers are actively being built.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 neon-border mb-6">
            <Hammer className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Work in Progress</span>
          </div>

          {/* Build progress */}
          <div className="mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Build progress</span>
              <span className="text-xs font-medium text-primary">40%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="h-full rounded-full bg-primary glow-box"
              />
            </div>
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
