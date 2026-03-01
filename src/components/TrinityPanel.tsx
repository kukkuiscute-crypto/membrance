import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grip, X, MessageSquare, FlaskConical, Calculator as CalcIcon, Briefcase, FileText } from "lucide-react";
import AIChatPanel from "./AIChatPanel";
import AdvancedCalculator from "./AdvancedCalculator";

type Tab = "amber" | "miraco" | "calc" | "project" | "summarizer";

const TrinityPanel = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("amber");

  const tabs: { key: Tab; label: string; icon: typeof MessageSquare }[] = [
    { key: "amber", label: "AMBER", icon: MessageSquare },
    { key: "miraco", label: "MIRACO", icon: FlaskConical },
    { key: "calc", label: "Calc", icon: CalcIcon },
    { key: "project", label: "Project", icon: Briefcase },
    { key: "summarizer", label: "Summary", icon: FileText },
  ];

  return (
    <>
      {/* Toggle — three vertical lines */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-3 top-20 z-50 p-2 rounded-lg glass-strong hover:bg-secondary/60 transition-all group"
        title="AI Tools"
      >
        <Grip className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[380px] max-w-[90vw] z-40 glass-strong border-l border-border/30 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h3 className="font-display text-sm font-bold tracking-wider text-foreground">AI TOOLS</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-secondary/60 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/30">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1 py-3 text-[10px] font-medium transition-all ${
                    tab === t.key
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {tab === "amber" && <AIChatPanel functionName="amber-ai" placeholder="Ask AMBER about your homework..." />}
              {tab === "miraco" && <AIChatPanel functionName="miraco-lly-ai" placeholder="Ask MIRACO-LLY about experiments..." />}
              {tab === "calc" && <AdvancedCalculator />}
              {tab === "project" && <AIChatPanel functionName="amber-ai" placeholder="Describe your project for step-by-step guidance..." />}
              {tab === "summarizer" && (
                <AIChatPanel functionName="amber-ai" placeholder="Paste a URL or describe content to summarize..." />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrinityPanel;
