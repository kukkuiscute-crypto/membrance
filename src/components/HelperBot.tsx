import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";

interface HelperBotProps {
  currentPage?: string;
  isPasswordFocused?: boolean;
}

const TIPS: Record<string, string[]> = {
  auth: [
    "👋 Welcome! Enter a username and password to sign up or log in.",
    "Pick a unique username — it's how others will know you!",
    "Your password should be at least 6 characters long.",
    "You can also sign in with Google for quick access!",
  ],
  dashboard: [
    "🎓 This is your dashboard! Explore subjects, videos, and more.",
    "Check the sidebar to navigate to different sections.",
    "Complete daily missions to earn points and level up!",
  ],
  videohub: [
    "🎬 Browse study videos by subject or search for topics.",
    "Save videos to watch later with the bookmark icon.",
    "Share your favorite educational videos with the community!",
  ],
  default: [
    "💡 Need help? Click me anytime for tips!",
    "📚 Keep studying consistently for the best results.",
    "🏆 Earn points by completing daily missions and watching videos.",
  ],
};

const LOOKING_AWAY_MESSAGES = [
  "🙈 I'm not looking, type your password safely!",
  "🫣 Privacy mode on — your secret is safe!",
  "👀➡️ Looking away while you type...",
];

const HelperBot = ({ currentPage = "default", isPasswordFocused = false }: HelperBotProps) => {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem("membrance_helper_bot");
    return stored !== "false";
  });
  const [showBubble, setShowBubble] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 80, y: 70 });
  const [lookingAway, setLookingAway] = useState(false);
  const animRef = useRef<number>();
  const tipIndexRef = useRef(0);
  const lastPageRef = useRef(currentPage);

  // Fly around gently
  useEffect(() => {
    if (!enabled) return;
    const updateTarget = () => {
      setTargetPos({
        x: 20 + Math.random() * 60,
        y: 15 + Math.random() * 55,
      });
    };
    updateTarget();
    const interval = setInterval(updateTarget, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [enabled]);

  // Smooth position lerp
  useEffect(() => {
    if (!enabled) return;
    let px = targetPos.x, py = targetPos.y;
    const lerp = () => {
      setPosition(prev => ({
        x: prev.x + (px - prev.x) * 0.02,
        y: prev.y + (py - prev.y) * 0.02,
      }));
      animRef.current = requestAnimationFrame(lerp);
    };
    animRef.current = requestAnimationFrame(lerp);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetPos, enabled]);

  // Update target when targetPos changes
  useEffect(() => {
    // just trigger re-render for lerp
  }, [targetPos]);

  // Show tip on page change
  useEffect(() => {
    if (!enabled) return;
    if (lastPageRef.current !== currentPage) {
      tipIndexRef.current = 0;
      lastPageRef.current = currentPage;
    }
    const tips = TIPS[currentPage] || TIPS.default;
    setMessage(tips[0]);
    setShowBubble(true);
    const timeout = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(timeout);
  }, [currentPage, enabled]);

  // Password focus — look away
  useEffect(() => {
    if (!enabled) return;
    if (isPasswordFocused) {
      setLookingAway(true);
      const msg = LOOKING_AWAY_MESSAGES[Math.floor(Math.random() * LOOKING_AWAY_MESSAGES.length)];
      setMessage(msg);
      setShowBubble(true);
    } else if (lookingAway) {
      setLookingAway(false);
      setShowBubble(false);
    }
  }, [isPasswordFocused, enabled]);

  const handleClick = useCallback(() => {
    const tips = TIPS[currentPage] || TIPS.default;
    tipIndexRef.current = (tipIndexRef.current + 1) % tips.length;
    setMessage(tips[tipIndexRef.current]);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 5000);
  }, [currentPage]);

  const toggleBot = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem("membrance_helper_bot", String(newVal));
  };

  if (!enabled) {
    return (
      <button onClick={toggleBot} title="Enable helper bot"
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-secondary/60 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-40 hover:opacity-100">
        <Bot className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[45]">
      <motion.div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        onClick={handleClick}
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[250px]"
            >
              <div className="glass rounded-lg px-3 py-2 text-xs text-foreground border border-border/30 shadow-lg whitespace-normal">
                {message}
              </div>
              <div className="w-2 h-2 glass border border-border/30 rotate-45 mx-auto -mt-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bot character */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            rotate: lookingAway ? 180 : [0, -3, 3, 0],
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotate: lookingAway ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-lg backdrop-blur-sm"
            style={{ boxShadow: `0 0 20px hsl(var(--primary) / 0.3)` }}>
            <Bot className="w-6 h-6 text-primary" />
          </div>
          {/* Close button */}
          <button onClick={(e) => { e.stopPropagation(); toggleBot(); }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
            <X className="w-2.5 h-2.5 text-white" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HelperBot;
