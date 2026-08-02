import { motion } from "framer-motion";
import { Rocket, Sparkles, History } from "lucide-react";
import { CHANGELOG, APP_VERSION } from "@/lib/changelog";

const Updates = () => (
  <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
    <div>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient">Update Directory</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Everything that has changed in MEMBRANCE · currently running <span className="text-primary font-semibold">{APP_VERSION}</span>
      </p>
    </div>

    <div className="relative pl-6">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/70 via-primary/25 to-transparent" />
      <div className="space-y-5">
        {CHANGELOG.map((entry, i) => (
          <motion.section
            key={entry.version}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.35 }}
            className={`surface-card p-5 hover-lift ${entry.current ? "ring-1 ring-primary/40" : ""}`}
          >
            <span
              className={`absolute -left-[1.4rem] top-6 w-3 h-3 rounded-full ${entry.current ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {entry.current ? <Rocket className="w-4 h-4 text-primary" /> : <History className="w-4 h-4 text-muted-foreground" />}
              <h2 className="font-display text-lg font-bold text-foreground">{entry.version}</h2>
              <span className="text-sm text-muted-foreground">· {entry.name}</span>
              {entry.current && (
                <span className="ml-auto text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/15 text-primary font-semibold">
                  Latest
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{entry.date}</p>
            <ul className="space-y-1.5">
              {entry.changes.map((c) => (
                <li key={c} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-1" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>
    </div>
  </div>
);

export default Updates;