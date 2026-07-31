import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, X } from "lucide-react";

/**
 * Floating "Alpha" chip — signals the product is still in early development.
 */
const AlphaBadge = () => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9998] flex flex-col items-start gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            className="surface-card w-[260px] p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="font-display text-sm font-bold text-foreground">Alpha build</p>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss alpha notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This website is in <span className="text-primary font-medium">alpha</span>. Features are still being
              built and things may change, break, or reset without warning. Thanks for testing early!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="alpha-chip flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-lg backdrop-blur-md transition-transform hover:scale-105"
      >
        <FlaskConical className="w-3.5 h-3.5 text-primary-foreground" />
        Alpha
      </button>
    </div>
  );
};

export default AlphaBadge;