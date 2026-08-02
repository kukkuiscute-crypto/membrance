import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle, Calculator, FileText, Anchor } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { botSpeak } from "@/lib/botVoice";

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
    "Psst — the site is in alpha, so expect new things often.",
    "Try the Study Tracker to keep your routine on rails.",
    "Themes live in Settings — there are a lot of them now!",
  ],
  videohub: [
    "Browse study videos by subject or search for topics.",
    "Save videos to watch later with the bookmark icon.",
    "Share your favorite educational videos with the community!",
    "Scroll forever — new videos keep loading as you go.",
  ],
  default: [
    "Need help? Click me anytime for tips!",
    "Keep studying consistently for the best results.",
    "Earn points by completing daily missions and watching videos.",
    "Drag me anywhere — then hit 'Stay Here' to pin me down.",
    "Flashcards get you points every flip until you master them.",
  ],
};

const LOOKING_AWAY_MESSAGES = [
  "I'm not looking, type your password safely!",
  "Privacy mode on — your secret is safe!",
  "Looking away while you type...",
];

const HelperBot = ({ currentPage = "default", isPasswordFocused = false }: HelperBotProps) => {
  const { user, isGuest } = useAuth();
  const loggedIn = !!user || isGuest;
  const [enabled, setEnabled] = useState(() => localStorage.getItem("membrance_helper_bot") !== "false");
  const [showMenu, setShowMenu] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [message, setMessage] = useState("");
  const [lookingAway, setLookingAway] = useState(false);
  const [isStaying, setIsStaying] = useState(false);
  const [popped, setPopped] = useState(false);
  const [waving, setWaving] = useState(false);

  // Pop-in when logged in — fires shortly after auth becomes true
  useEffect(() => {
    if (!loggedIn || !enabled) { setPopped(false); return; }
    setPopped(false);
    const t = setTimeout(() => setPopped(true), 350);
    return () => clearTimeout(t);
  }, [loggedIn, enabled]);

  // All positional state is ref-based — zero re-renders per frame
  const posRef = useRef({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.6 });
  const targetRef = useRef({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.6 });
  const mousePosRef = useRef({ x: 0, y: 0 });
  const botElRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);
  const leftHighlightRef = useRef<SVGCircleElement>(null);
  const rightHighlightRef = useRef<SVGCircleElement>(null);
  const animRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const isStayingRef = useRef(false);
  const lookingAwayRef = useRef(false);
  const tipIndexRef = useRef(0);
  const lastPageRef = useRef(currentPage);
  const dragStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  // Keep refs in sync with state
  isStayingRef.current = isStaying;
  lookingAwayRef.current = lookingAway;

  // Mouse tracking — passive, no state
  useEffect(() => {
    const handler = (e: MouseEvent) => { mousePosRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Random flight targets
  useEffect(() => {
    if (!enabled || isStaying) return;
    const updateTarget = () => {
      targetRef.current = {
        x: 60 + Math.random() * (window.innerWidth - 120),
        y: 60 + Math.random() * (window.innerHeight - 140),
      };
    };
    updateTarget();
    const interval = setInterval(updateTarget, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [enabled, isStaying]);

  // Single rAF loop — all DOM updates via refs, no setState
  useEffect(() => {
    if (!enabled) return;
    const animate = (time: number) => {
      const bob = Math.sin(time / 400) * 4;
      const pos = posRef.current;
      const target = targetRef.current;

      // Lerp position
      if (!isStayingRef.current && !isDraggingRef.current) {
        pos.x += (target.x - pos.x) * 0.008;
        pos.y += (target.y - pos.y) * 0.008;
      }

      // Apply transform directly to DOM
      if (botElRef.current) {
        botElRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y + bob}px, 0)`;
      }

      // Eye tracking
      const cx = pos.x + 35;
      const cy = pos.y + 20;
      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const max = 3;

      let lx: number, ly: number;
      if (lookingAwayRef.current) {
        lx = -3; ly = 0;
      } else {
        lx = (dx / dist) * max;
        ly = (dy / dist) * max;
      }

      if (leftPupilRef.current) {
        leftPupilRef.current.setAttribute("cx", String(24 + lx));
        leftPupilRef.current.setAttribute("cy", String(22 + ly));
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.setAttribute("cx", String(46 + lx));
        rightPupilRef.current.setAttribute("cy", String(22 + ly));
      }
      if (leftHighlightRef.current) {
        leftHighlightRef.current.setAttribute("cx", String(24 + lx - 1));
        leftHighlightRef.current.setAttribute("cy", String(22 + ly - 1));
      }
      if (rightHighlightRef.current) {
        rightHighlightRef.current.setAttribute("cx", String(46 + lx - 1));
        rightHighlightRef.current.setAttribute("cy", String(22 + ly - 1));
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [enabled]);

  // Tips on page change
  useEffect(() => {
    if (!enabled) return;
    if (lastPageRef.current !== currentPage) { tipIndexRef.current = 0; lastPageRef.current = currentPage; }
    const tips = TIPS[currentPage] || TIPS.default;
    setMessage(tips[0]);
    setShowTip(true);
    const timeout = setTimeout(() => setShowTip(false), 5000);
    return () => clearTimeout(timeout);
  }, [currentPage, enabled]);

  // Password focus
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

  const handleClick = useCallback(() => {
    if (!isDraggingRef.current) {
      setShowMenu(prev => !prev);
      setShowTip(false);
      setWaving(true);
      setTimeout(() => setWaving(false), 2200);
    }
  }, []);

  const showNextTip = useCallback(() => {
    const tips = TIPS[currentPage] || TIPS.default;
    tipIndexRef.current = (tipIndexRef.current + 1) % tips.length;
    setMessage(tips[tipIndexRef.current]);
    setShowTip(true);
    setShowMenu(false);
    setWaving(true);
    botSpeak(tips[tipIndexRef.current]);
    setTimeout(() => setWaving(false), 2200);
    setTimeout(() => setShowTip(false), 5000);
  }, [currentPage]);

  const toggleBot = () => {
    const v = !enabled;
    setEnabled(v);
    localStorage.setItem("membrance_helper_bot", String(v));
  };

  // Dragging via pointer events
  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY, px: posRef.current.x, py: posRef.current.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    posRef.current.x = dragStartRef.current.px + (e.clientX - dragStartRef.current.x);
    posRef.current.y = dragStartRef.current.py + (e.clientY - dragStartRef.current.y);
  };
  const onPointerUp = () => {
    isDraggingRef.current = false;
    if (isStayingRef.current) {
      targetRef.current = { ...posRef.current };
    }
  };

  // Hide entirely when not logged in — the bot "pops out of nowhere" once you sign in
  if (!loggedIn) return null;

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
      ref={botElRef}
      className="fixed z-[9999] select-none"
      style={{
        left: 0,
        top: 0,
        willChange: "transform",
        touchAction: "none",
        cursor: "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={handleClick}
    >
      <div
        style={{
          transform: popped ? "scale(1) rotate(0deg)" : "scale(0) rotate(-30deg)",
          opacity: popped ? 1 : 0,
          transition: "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-out",
          transformOrigin: "35px 90px",
          willChange: "transform, opacity",
        }}
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

      {/* Bot SVG */}
      <svg width="70" height="95" viewBox="0 0 70 95" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--card))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
          <radialGradient id="screenGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.08)" />
          </radialGradient>
          <radialGradient id="thrusterGrad" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="35%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--glow))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(var(--glow))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient aura */}
        <ellipse cx="35" cy="42" rx="33" ry="45" fill="url(#auraGrad)">
          <animate attributeName="rx" values="30;34;30" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
        </ellipse>

        {/* Thruster — sleek single plume */}
        <g filter="url(#soft)">
          <ellipse cx="35" cy="88" rx="12" ry="5" fill="url(#thrusterGrad)" opacity="0.85">
            <animate attributeName="ry" values="4;7;4" dur="0.35s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="0.35s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="35" cy="86" rx="5" ry="2.5" fill="white" opacity="0.7">
            <animate attributeName="ry" values="1.5;3;1.5" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
        </g>
        {/* Spark */}
        <circle cx="35" cy="94" r="0.9" fill="hsl(var(--primary))" opacity="0.5">
          <animate attributeName="cy" values="93;100;93" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="0.9s" repeatCount="indefinite" />
        </circle>

        {/* Body — capsule with gradient */}
        <rect x="17" y="49" width="36" height="30" rx="14" fill="url(#bodyGrad)" stroke="hsl(var(--primary) / 0.55)" strokeWidth="1" />
        {/* Screen */}
        <rect x="22" y="55" width="26" height="13" rx="4" fill="url(#screenGrad)" stroke="hsl(var(--primary) / 0.4)" strokeWidth="0.6" />
        <text x="35" y="64" textAnchor="middle" fontSize="6" fill="hsl(var(--primary))" fontFamily="monospace" fontWeight="bold" letterSpacing="1">BOT</text>

        {/* Arms */}
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
            <animateTransform attributeName="transform" type="rotate"
              values={waving ? "-55,52,56;-95,52,56;-55,52,56" : "8,52,56;-12,52,56;8,52,56"}
              dur={waving ? "0.45s" : "3.5s"} repeatCount="indefinite" />
          </rect>
          <circle cx="65" cy="56" r="3" fill="hsl(var(--primary))" opacity={waving ? 0.75 : 0.4}>
            <animateTransform attributeName="transform" type="rotate"
              values={waving ? "-55,52,56;-95,52,56;-55,52,56" : "8,52,56;-12,52,56;8,52,56"}
              dur={waving ? "0.45s" : "3.5s"} repeatCount="indefinite" />
          </circle>
        </g>

        {/* Head — softer, sleeker */}
        <rect x="7" y="2" width="56" height="48" rx="22" fill="url(#bodyGrad)" stroke="hsl(var(--primary) / 0.55)" strokeWidth="1">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </rect>
        {/* Visor highlight */}
        <path d="M14 12 Q18 6 35 6 Q52 6 56 12" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Antenna */}
        <line x1="35" y1="4" x2="35" y2="-2" stroke="hsl(var(--primary))" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </line>
        <circle cx="35" cy="-3" r="2.8" fill="hsl(var(--primary))" opacity="0.9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Left eye */}
        <ellipse cx="24" cy="22" rx="8" ry="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="0.8">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <circle ref={leftPupilRef} cx="24" cy="22" r="3.5" fill="hsl(var(--primary))">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle ref={leftHighlightRef} cx="23" cy="21" r="1.2" fill="white" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Right eye */}
        <ellipse cx="46" cy="22" rx="8" ry="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="0.8">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <circle ref={rightPupilRef} cx="46" cy="22" r="3.5" fill="hsl(var(--primary))">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle ref={rightHighlightRef} cx="45" cy="21" r="1.2" fill="white" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" values="-2,35,26;2,35,26;-2,35,26" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Blink */}
        <rect x="14" y="14" width="22" height="18" rx="8" fill="hsl(var(--card))" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="4s" keyTimes="0;0.92;0.94;0.96;0.98;1" repeatCount="indefinite" />
        </rect>
        <rect x="36" y="14" width="22" height="18" rx="8" fill="hsl(var(--card))" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="4s" keyTimes="0;0.92;0.94;0.96;0.98;1" repeatCount="indefinite" />
        </rect>

        {/* Blush */}
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
    </div>
  );
};

export default HelperBot;
