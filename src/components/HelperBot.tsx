import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Calculator, FileText } from "lucide-react";

interface HelperBotProps {
  currentPage?: string;
  isPasswordFocused?: boolean;
}

const TIPS: Record<string, string[]> = {
  auth: [
    "Welcome! Enter a username and password to sign up or log in.",
    "Pick a unique username — it's how others will know you!",
    "Your password should be at least 6 characters long.",
    "You can also sign in with Google for quick access!",
  ],
  dashboard: [
    "This is your dashboard! Explore subjects, videos, and more.",
    "Check the sidebar to navigate to different sections.",
    "Complete daily missions to earn points and level up!",
  ],
  videohub: [
    "Browse study videos by subject or search for topics.",
    "Save videos to watch later with the bookmark icon.",
    "Share your favorite educational videos with the community!",
  ],
  default: [
    "Need help? Click me anytime for tips!",
    "Keep studying consistently for the best results.",
    "Earn points by completing daily missions and watching videos.",
  ],
};

const LOOKING_AWAY_MESSAGES = [
  "I'm not looking, type your password safely!",
  "Privacy mode on — your secret is safe!",
  "Looking away while you type...",
];

const HelperBot = ({ currentPage = "default", isPasswordFocused = false }: HelperBotProps) => {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem("membrance_helper_bot");
    return stored !== "false";
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState({ x: 75, y: 65 });
  const [targetPos, setTargetPos] = useState({ x: 75, y: 65 });
  const [lookingAway, setLookingAway] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyesFire, setEyesFire] = useState(false);
  const [bobPhase, setBobPhase] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const animRef = useRef<number>();
  const tipIndexRef = useRef(0);
  const lastPageRef = useRef(currentPage);
  const botRef = useRef<HTMLDivElement>(null);

  // Track mouse for eye following
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Fly around gently
  useEffect(() => {
    if (!enabled) return;
    const updateTarget = () => {
      setTargetPos({
        x: 15 + Math.random() * 65,
        y: 12 + Math.random() * 55,
      });
    };
    updateTarget();
    const interval = setInterval(updateTarget, 5000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [enabled]);

  // Smooth position lerp + bob animation at ~60fps via rAF
  useEffect(() => {
    if (!enabled) return;
    let lastTime = performance.now();
    const lerp = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const speed = 1.5;
      setPosition(prev => ({
        x: prev.x + (targetPos.x - prev.x) * speed * dt,
        y: prev.y + (targetPos.y - prev.y) * speed * dt,
      }));
      setBobPhase(p => p + dt * 3);
      setHeadTilt(Math.sin(time / 1500) * 4);
      animRef.current = requestAnimationFrame(lerp);
    };
    animRef.current = requestAnimationFrame(lerp);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetPos, enabled]);

  // Show tip on page change
  useEffect(() => {
    if (!enabled) return;
    if (lastPageRef.current !== currentPage) {
      tipIndexRef.current = 0;
      lastPageRef.current = currentPage;
    }
    const tips = TIPS[currentPage] || TIPS.default;
    setMessage(tips[0]);
    setShowTip(true);
    const timeout = setTimeout(() => setShowTip(false), 5000);
    return () => clearTimeout(timeout);
  }, [currentPage, enabled]);

  // Password focus — look away
  useEffect(() => {
    if (!enabled) return;
    if (isPasswordFocused) {
      setLookingAway(true);
      const msg = LOOKING_AWAY_MESSAGES[Math.floor(Math.random() * LOOKING_AWAY_MESSAGES.length)];
      setMessage(msg);
      setShowTip(true);
    } else if (lookingAway) {
      setLookingAway(false);
      setShowTip(false);
    }
  }, [isPasswordFocused, enabled]);

  // Fire eyes effect (trigger externally or on correct answer)
  const triggerFireEyes = useCallback(() => {
    setEyesFire(true);
    setTimeout(() => setEyesFire(false), 2000);
  }, []);

  const handleClick = useCallback(() => {
    setShowMenu(prev => !prev);
    setShowTip(false);
  }, []);

  const showNextTip = useCallback(() => {
    const tips = TIPS[currentPage] || TIPS.default;
    tipIndexRef.current = (tipIndexRef.current + 1) % tips.length;
    setMessage(tips[tipIndexRef.current]);
    setShowTip(true);
    setShowMenu(false);
    setTimeout(() => setShowTip(false), 5000);
  }, [currentPage]);

  const toggleBot = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem("membrance_helper_bot", String(newVal));
  };

  // Calculate eye direction
  const getEyeOffset = () => {
    if (lookingAway) return { lx: -3, ly: 0, rx: -3, ry: 0 };
    if (!botRef.current) return { lx: 0, ly: 0, rx: 0, ry: 0 };
    const rect = botRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mousePos.x - cx;
    const dy = mousePos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const maxOffset = 2.5;
    return {
      lx: (dx / dist) * maxOffset,
      ly: (dy / dist) * maxOffset,
      rx: (dx / dist) * maxOffset,
      ry: (dy / dist) * maxOffset,
    };
  };

  const eye = getEyeOffset();
  const bobY = Math.sin(bobPhase) * 5;

  if (!enabled) {
    return (
      <button onClick={toggleBot} title="Enable helper bot"
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-secondary/60 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-40 hover:opacity-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M8 8V6a4 4 0 1 1 8 0v2"/></svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[45]">
      <div
        ref={botRef}
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translateY(${bobY}px)`,
          willChange: "left, top, transform",
        }}
        onClick={handleClick}
      >
        {/* Tip bubble */}
        <AnimatePresence>
          {showTip && !showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 8 }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[220px]"
            >
              <div className="glass rounded-lg px-3 py-2 text-xs text-foreground border border-primary/20 shadow-lg">
                {message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[200px]"
            >
              <div className="glass rounded-xl p-2 border border-primary/20 shadow-xl space-y-1">
                <button onClick={(e) => { e.stopPropagation(); showNextTip(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-primary/10 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" /> Get a Tip
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); toast("Video summary coming soon!"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-primary/10 transition-colors">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Video Summary
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); toast("Quick calculator coming soon!"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-primary/10 transition-colors">
                  <Calculator className="w-3.5 h-3.5 text-primary" /> Quick Calculation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bot body */}
        <svg width="56" height="72" viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ transform: `rotate(${headTilt}deg)`, transition: "transform 0.3s ease" }}>
          {/* Thruster flames */}
          <g>
            <motion.ellipse cx="22" cy="68" rx="4" ry="3"
              animate={{ ry: [2, 5, 2], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
              fill="hsl(var(--primary))" opacity="0.7" />
            <motion.ellipse cx="34" cy="68" rx="4" ry="3"
              animate={{ ry: [3, 5, 3], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.12, repeat: Infinity, ease: "linear", delay: 0.05 }}
              fill="hsl(var(--primary))" opacity="0.7" />
            <motion.ellipse cx="28" cy="70" rx="3" ry="4"
              animate={{ ry: [2, 6, 2], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 0.1, repeat: Infinity, ease: "linear", delay: 0.03 }}
              fill="orange" opacity="0.5" />
          </g>

          {/* Body */}
          <rect x="10" y="30" width="36" height="32" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.9" />

          {/* Screen on body */}
          <rect x="15" y="35" width="26" height="14" rx="3" fill="hsl(var(--primary))" opacity="0.15" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          <text x="28" y="45" textAnchor="middle" fontSize="6" fill="hsl(var(--primary))" fontFamily="monospace" fontWeight="bold">BOT</text>

          {/* Arms */}
          {/* Left arm pointing */}
          <motion.g animate={{ rotate: [-10, 15, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "10px 40px" }}>
            <rect x="0" y="36" width="12" height="4" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1" />
            <circle cx="1" cy="38" r="2.5" fill="hsl(var(--primary))" opacity="0.5" />
          </motion.g>
          {/* Right arm */}
          <motion.g animate={{ rotate: [10, -15, 10] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "46px 40px" }}>
            <rect x="44" y="36" width="12" height="4" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1" />
            <circle cx="55" cy="38" r="2.5" fill="hsl(var(--primary))" opacity="0.5" />
          </motion.g>

          {/* Head */}
          <rect x="12" y="4" width="32" height="28" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />

          {/* Antenna */}
          <line x1="28" y1="4" x2="28" y2="0" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <motion.circle cx="28" cy="0" r="2.5"
            animate={{ fill: eyesFire ? ["hsl(0, 100%, 50%)", "hsl(30, 100%, 50%)", "hsl(0, 100%, 50%)"] : "hsl(var(--primary))" }}
            transition={{ duration: 0.3, repeat: eyesFire ? Infinity : 0 }}
            fill="hsl(var(--primary))" opacity="0.8" />

          {/* Eyes */}
          {/* Left eye */}
          <ellipse cx="21" cy="16" rx="5" ry="5.5" fill={eyesFire ? "hsl(0, 90%, 20%)" : "hsl(var(--background))"} stroke="hsl(var(--primary))" strokeWidth="0.8" />
          <motion.circle cx={21 + eye.lx} cy={16 + eye.ly} r={eyesFire ? 3 : 2.2}
            fill={eyesFire ? "orange" : "hsl(var(--primary))"}
            animate={eyesFire ? { r: [2.2, 3.5, 2.2], fill: ["hsl(0, 100%, 50%)", "hsl(40, 100%, 50%)", "hsl(0, 100%, 50%)"] } : {}}
            transition={eyesFire ? { duration: 0.2, repeat: Infinity } : {}} />
          {!eyesFire && <circle cx={21 + eye.lx - 0.5} cy={16 + eye.ly - 0.5} r="0.7" fill="white" opacity="0.8" />}
          {eyesFire && (
            <motion.g animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 0.15, repeat: Infinity }}>
              <ellipse cx={21 + eye.lx} cy={13} rx="2" ry="3" fill="orange" opacity="0.4" />
            </motion.g>
          )}

          {/* Right eye */}
          <ellipse cx="35" cy="16" rx="5" ry="5.5" fill={eyesFire ? "hsl(0, 90%, 20%)" : "hsl(var(--background))"} stroke="hsl(var(--primary))" strokeWidth="0.8" />
          <motion.circle cx={35 + eye.rx} cy={16 + eye.ry} r={eyesFire ? 3 : 2.2}
            fill={eyesFire ? "orange" : "hsl(var(--primary))"}
            animate={eyesFire ? { r: [2.2, 3.5, 2.2], fill: ["hsl(0, 100%, 50%)", "hsl(40, 100%, 50%)", "hsl(0, 100%, 50%)"] } : {}}
            transition={eyesFire ? { duration: 0.2, repeat: Infinity } : {}} />
          {!eyesFire && <circle cx={35 + eye.rx - 0.5} cy={16 + eye.ry - 0.5} r="0.7" fill="white" opacity="0.8" />}
          {eyesFire && (
            <motion.g animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 0.15, repeat: Infinity }}>
              <ellipse cx={35 + eye.rx} cy={13} rx="2" ry="3" fill="orange" opacity="0.4" />
            </motion.g>
          )}

          {/* Mouth */}
          <motion.path
            d={lookingAway ? "M22 24 Q28 22 34 24" : "M22 24 Q28 28 34 24"}
            stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" strokeLinecap="round"
          />
        </svg>

        {/* Close button */}
        <button onClick={(e) => { e.stopPropagation(); toggleBot(); }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
          <X className="w-2.5 h-2.5 text-white" />
        </button>
      </div>
    </div>
  );
};

// Need toast import
import { toast } from "sonner";

export default HelperBot;
