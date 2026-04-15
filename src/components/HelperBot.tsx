import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Calculator, FileText, Anchor } from "lucide-react";
import { toast } from "sonner";

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
  const [enabled, setEnabled] = useState(() => localStorage.getItem("membrance_helper_bot") !== "false");
  const [showMenu, setShowMenu] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [message, setMessage] = useState("");
  const [lookingAway, setLookingAway] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyesFire, setEyesFire] = useState(false);
  const [isStaying, setIsStaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Use CSS-based position for dragging
  const [pos, setPos] = useState({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.6 });
  const [targetPos, setTargetPos] = useState({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.6 });
  
  const tipIndexRef = useRef(0);
  const lastPageRef = useRef(currentPage);
  const botRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>();
  const bobRef = useRef(0);

  // Track mouse for eye following — passive, no state thrash
  const mousePosRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => { mousePosRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Fly to random spots when not staying
  useEffect(() => {
    if (!enabled || isStaying) return;
    const updateTarget = () => {
      setTargetPos({
        x: 60 + Math.random() * (window.innerWidth - 120),
        y: 60 + Math.random() * (window.innerHeight - 140),
      });
    };
    updateTarget();
    const interval = setInterval(updateTarget, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [enabled, isStaying]);

  // Animation loop — single rAF, no React state per frame
  useEffect(() => {
    if (!enabled) return;
    const animate = (time: number) => {
      bobRef.current = Math.sin(time / 400) * 4;
      // Lerp position toward target (skip if staying or dragging)
      if (!isStaying && !isDragging) {
        setPos(prev => ({
          x: prev.x + (targetPos.x - prev.x) * 0.008,
          y: prev.y + (targetPos.y - prev.y) * 0.008,
        }));
      }
      // Update mouse for eyes without causing re-renders
      setMousePos(mousePosRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetPos, enabled, isStaying, isDragging]);

  // Show tip on page change
  useEffect(() => {
    if (!enabled) return;
    if (lastPageRef.current !== currentPage) { tipIndexRef.current = 0; lastPageRef.current = currentPage; }
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
      setMessage(LOOKING_AWAY_MESSAGES[Math.floor(Math.random() * LOOKING_AWAY_MESSAGES.length)]);
      setShowTip(true);
    } else if (lookingAway) {
      setLookingAway(false);
      setShowTip(false);
    }
  }, [isPasswordFocused, enabled]);

  const handleClick = useCallback(() => { if (!isDragging) { setShowMenu(prev => !prev); setShowTip(false); } }, [isDragging]);

  const showNextTip = useCallback(() => {
    const tips = TIPS[currentPage] || TIPS.default;
    tipIndexRef.current = (tipIndexRef.current + 1) % tips.length;
    setMessage(tips[tipIndexRef.current]);
    setShowTip(true);
    setShowMenu(false);
    setTimeout(() => setShowTip(false), 5000);
  }, [currentPage]);

  const toggleBot = () => { const v = !enabled; setEnabled(v); localStorage.setItem("membrance_helper_bot", String(v)); };

  // Eye tracking calc
  const getEyeOffset = () => {
    if (lookingAway) return { lx: -3, ly: 0, rx: -3, ry: 0 };
    const cx = pos.x + 35;
    const cy = pos.y + 20;
    const dx = mousePos.x - cx;
    const dy = mousePos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const max = 3;
    return { lx: (dx / dist) * max, ly: (dy / dist) * max, rx: (dx / dist) * max, ry: (dy / dist) * max };
  };

  // Dragging with pointer events for max perf
  const dragStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({ x: dragStartRef.current.px + dx, y: dragStartRef.current.py + dy });
  };
  const onPointerUp = () => {
    setIsDragging(false);
    if (isStaying) setTargetPos(pos);
  };

  const eye = getEyeOffset();
  const bob = bobRef.current;

  if (!enabled) {
    return (
      <button onClick={toggleBot} title="Enable helper bot"
        className="fixed bottom-4 right-4 z-[9999] w-10 h-10 rounded-full bg-secondary/60 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-40 hover:opacity-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M8 8V6a4 4 0 1 1 8 0v2"/></svg>
      </button>
    );
  }

  return (
    <div
      ref={botRef}
      className="fixed z-[9999] select-none"
      style={{
        left: pos.x,
        top: pos.y + bob,
        cursor: isDragging ? "grabbing" : "grab",
        willChange: "transform",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={handleClick}
    >
      {/* Tip bubble */}
      <AnimatePresence>
        {showTip && !showMenu && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 8 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[220px] pointer-events-none">
            <div className="bg-card/95 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-foreground border border-primary/20 shadow-lg">
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 8 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[210px]">
            <div className="bg-card/95 backdrop-blur-md rounded-xl p-2 border border-primary/20 shadow-xl space-y-1">
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
              <div className="border-t border-border/30 my-1" />
              <button onClick={(e) => { e.stopPropagation(); setIsStaying(!isStaying); setShowMenu(false); toast(isStaying ? "Bot is free to roam!" : "Bot will stay here!"); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${isStaying ? "text-primary bg-primary/10" : "text-foreground hover:bg-primary/10"}`}>
                <Anchor className="w-3.5 h-3.5" /> {isStaying ? "Roam Free" : "Stay Here"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleBot(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                <X className="w-3.5 h-3.5" /> Hide Bot
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot SVG — bigger head, cuter proportions */}
      <svg width="70" height="90" viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Thruster flames */}
        <g opacity="0.8">
          <ellipse cx="26" cy="86" rx="5" ry="3" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="ry" values="2;5;2" dur="0.15s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="44" cy="86" rx="5" ry="3" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="ry" values="3;6;3" dur="0.12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="35" cy="88" rx="3" ry="4" fill="orange" opacity="0.4">
            <animate attributeName="ry" values="2;6;2" dur="0.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="0.1s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Body — smaller, cute */}
        <rect x="18" y="48" width="34" height="30" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.95" />

        {/* Screen on body */}
        <rect x="23" y="53" width="24" height="12" rx="3" fill="hsl(var(--primary))" opacity="0.12" stroke="hsl(var(--primary))" strokeWidth="0.5" />
        <text x="35" y="62" textAnchor="middle" fontSize="6" fill="hsl(var(--primary))" fontFamily="monospace" fontWeight="bold">BOT</text>

        {/* Arms with wave animation */}
        <g>
          <rect x="4" y="54" width="16" height="4.5" rx="2.2" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1">
            <animateTransform attributeName="transform" type="rotate" values="-8,18,56;12,18,56;-8,18,56" dur="3s" repeatCount="indefinite" />
          </rect>
          <circle cx="5" cy="56" r="3" fill="hsl(var(--primary))" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" values="-8,18,56;12,18,56;-8,18,56" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
        <g>
          <rect x="50" y="54" width="16" height="4.5" rx="2.2" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1">
            <animateTransform attributeName="transform" type="rotate" values="8,52,56;-12,52,56;8,52,56" dur="3.5s" repeatCount="indefinite" />
          </rect>
          <circle cx="65" cy="56" r="3" fill="hsl(var(--primary))" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" values="8,52,56;-12,52,56;8,52,56" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Head — BIG, cute, rounded */}
        <rect x="8" y="2" width="54" height="48" rx="18" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </rect>

        {/* Antenna */}
        <line x1="35" y1="4" x2="35" y2="-2" stroke="hsl(var(--primary))" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </line>
        <circle cx="35" cy="-3" r="3.5" fill="hsl(var(--primary))" opacity="0.8">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Left eye — big cute */}
        <ellipse cx="24" cy="22" rx="8" ry="9" fill={eyesFire ? "hsl(0, 90%, 15%)" : "hsl(var(--background))"} stroke="hsl(var(--primary))" strokeWidth="0.8">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <circle cx={24 + eye.lx} cy={22 + eye.ly} r={eyesFire ? 4.5 : 3.5} fill={eyesFire ? "orange" : "hsl(var(--primary))"}>
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>
        {!eyesFire && <circle cx={24 + eye.lx - 1} cy={22 + eye.ly - 1} r="1.2" fill="white" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>}
        {eyesFire && (
          <ellipse cx={24 + eye.lx} cy={17} rx="3" ry="5" fill="orange" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.7;0.2" dur="0.15s" repeatCount="indefinite" />
            <animate attributeName="ry" values="4;7;4" dur="0.2s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Right eye — big cute */}
        <ellipse cx="46" cy="22" rx="8" ry="9" fill={eyesFire ? "hsl(0, 90%, 15%)" : "hsl(var(--background))"} stroke="hsl(var(--primary))" strokeWidth="0.8">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <circle cx={46 + eye.rx} cy={22 + eye.ry} r={eyesFire ? 4.5 : 3.5} fill={eyesFire ? "orange" : "hsl(var(--primary))"}>
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>
        {!eyesFire && <circle cx={46 + eye.rx - 1} cy={22 + eye.ry - 1} r="1.2" fill="white" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>}
        {eyesFire && (
          <ellipse cx={46 + eye.rx} cy={17} rx="3" ry="5" fill="orange" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.7;0.2" dur="0.15s" repeatCount="indefinite" />
            <animate attributeName="ry" values="4;7;4" dur="0.2s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Blink animation — eyelids */}
        <rect x="14" y="14" width="22" height="18" rx="8" fill="hsl(var(--card))" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="4s" keyTimes="0;0.92;0.94;0.96;0.98;1" repeatCount="indefinite" />
        </rect>
        <rect x="36" y="14" width="22" height="18" rx="8" fill="hsl(var(--card))" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="4s" keyTimes="0;0.92;0.94;0.96;0.98;1" repeatCount="indefinite" />
        </rect>

        {/* Cute blush circles */}
        <circle cx="16" cy="32" r="4" fill="hsl(var(--primary))" opacity="0.08" />
        <circle cx="54" cy="32" r="4" fill="hsl(var(--primary))" opacity="0.08" />

        {/* Mouth */}
        <path d={lookingAway ? "M28 36 Q35 33 42 36" : "M28 36 Q35 42 42 36"} stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </path>

        {/* Stay indicator */}
        {isStaying && (
          <circle cx="35" cy="82" r="2" fill="hsl(var(--primary))" opacity="0.6">
            <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
};

export default HelperBot;
