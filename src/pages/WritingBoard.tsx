import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Eraser, Lock, Volume2, VolumeX, PenLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { botSpeak, isBotVoiceOn, stopBotSpeech } from "@/lib/botVoice";

const EXAMPLES = ["12 + 47", "3/4 + 5/6", "2x + 5 = 17", "Area of a circle with r = 7", "15% of 240"];

/** Little chalk-holding version of the Helper Bot that lives on the board. */
const ChalkBot = ({ writing }: { writing: boolean }) => (
  <svg width="120" height="150" viewBox="0 0 120 150" fill="none" aria-hidden="true" className="drop-shadow-lg">
    <defs>
      <linearGradient id="wbBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--card))" />
        <stop offset="100%" stopColor="hsl(var(--secondary))" />
      </linearGradient>
      <radialGradient id="wbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
        <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
      </radialGradient>
    </defs>

    <ellipse cx="60" cy="70" rx="52" ry="62" fill="url(#wbGlow)">
      <animate attributeName="rx" values="48;54;48" dur="4s" repeatCount="indefinite" />
    </ellipse>

    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="3.2s" repeatCount="indefinite" />

      {/* thruster */}
      <ellipse cx="60" cy="132" rx="14" ry="6" fill="hsl(var(--primary) / 0.55)">
        <animate attributeName="ry" values="4;8;4" dur="0.35s" repeatCount="indefinite" />
      </ellipse>

      {/* body */}
      <rect x="34" y="82" width="52" height="42" rx="20" fill="url(#wbBody)" stroke="hsl(var(--primary) / 0.55)" strokeWidth="1.5" />
      <rect x="42" y="92" width="36" height="18" rx="6" fill="hsl(var(--primary) / 0.18)" stroke="hsl(var(--primary) / 0.4)" />
      <text x="60" y="105" textAnchor="middle" fontSize="8" fill="hsl(var(--primary))" fontFamily="monospace" fontWeight="bold">BOT</text>

      {/* chalk arm */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={writing ? "-18 86 92;18 86 92;-6 86 92;-18 86 92" : "-6 86 92;4 86 92;-6 86 92"}
          dur={writing ? "0.9s" : "3.4s"}
          repeatCount="indefinite"
        />
        <rect x="82" y="89" width="26" height="6" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.4" />
        <rect x="106" y="86" width="12" height="11" rx="2.5" fill="hsl(0 0% 96%)" stroke="hsl(0 0% 70%)" />
      </g>

      {/* left arm */}
      <rect x="12" y="89" width="24" height="6" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.4">
        <animateTransform attributeName="transform" type="rotate" values="6 34 92;-10 34 92;6 34 92" dur="3.8s" repeatCount="indefinite" />
      </rect>

      {/* head */}
      <rect x="18" y="18" width="84" height="66" rx="30" fill="url(#wbBody)" stroke="hsl(var(--primary) / 0.55)" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="rotate" values="-2 60 50;2 60 50;-2 60 50" dur="4.6s" repeatCount="indefinite" />
      </rect>
      <circle cx="44" cy="50" r="9" fill="hsl(var(--background))" />
      <circle cx="76" cy="50" r="9" fill="hsl(var(--background))" />
      <circle cx="44" cy="50" r="4.5" fill="hsl(var(--primary))">
        <animate attributeName="r" values="4.5;0.6;4.5" dur="5s" keyTimes="0;0.03;0.06" repeatCount="indefinite" />
      </circle>
      <circle cx="76" cy="50" r="4.5" fill="hsl(var(--primary))">
        <animate attributeName="r" values="4.5;0.6;4.5" dur="5s" keyTimes="0;0.03;0.06" repeatCount="indefinite" />
      </circle>
      <path d="M50 66 Q60 74 70 66" stroke="hsl(var(--primary))" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <line x1="60" y1="18" x2="60" y2="8" stroke="hsl(var(--primary))" strokeWidth="2" />
      <circle cx="60" cy="6" r="4" fill="hsl(var(--primary))">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);

const WritingBoard = () => {
  const { user, isGuest } = useAuth();
  const isLoggedIn = !!user && !isGuest;
  const [question, setQuestion] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [visible, setVisible] = useState(0);
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(isBotVoiceOn());
  const boardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  const writing = loading || visible < steps.length;

  // Reveal each chalk line one after another, like real board work.
  useEffect(() => {
    if (visible >= steps.length) return;
    timerRef.current = window.setTimeout(() => {
      setVisible((v) => {
        const next = v + 1;
        if (voice && steps[v]) botSpeak(steps[v]);
        return next;
      });
      boardRef.current?.scrollTo({ top: boardRef.current.scrollHeight, behavior: "smooth" });
    }, 750);
    return () => window.clearTimeout(timerRef.current);
  }, [visible, steps, voice]);

  useEffect(() => () => stopBotSpeech(), []);

  const solve = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) { toast.error("Write an equation or question on the board first"); return; }
    if (!isLoggedIn) { toast.error("Sign in with a username to use the AI board"); return; }
    stopBotSpeech();
    setLoading(true);
    setSteps([]);
    setVisible(0);
    try {
      const { data, error } = await supabase.functions.invoke("amber-ai", {
        body: {
          messages: [{
            role: "user",
            content:
              `You are writing on a classroom chalkboard. Explain how to solve "${q}" step by step for a school student. ` +
              `Reply with ONLY numbered short lines (max 12 words each), starting with "Step 1:". End with a final line "Answer: ...".`,
          }],
        },
      });
      if (error) throw error;
      const text: string = data?.reply || data?.choices?.[0]?.message?.content || "";
      const lines = text
        .split("\n")
        .map((l) => l.replace(/^[*\-•]\s*/, "").replace(/[*#`]/g, "").trim())
        .filter(Boolean);
      if (!lines.length) throw new Error("empty");
      setSteps(lines);
    } catch {
      toast.error("The bot couldn't reach the chalkboard. Try again.");
    }
    setLoading(false);
  }, [isLoggedIn]);

  const clearBoard = () => {
    stopBotSpeech();
    setSteps([]);
    setVisible(0);
    setQuestion("");
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="surface-card p-12 text-center max-w-md">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-lg font-bold text-foreground mb-2">Writing Board Locked</h2>
          <p className="text-sm text-muted-foreground">Sign in with a username so the Helper Bot can pick up the chalk for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient">AI Writing Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Ask anything — the Helper Bot grabs a chalk and works it out step by step.</p>
        </div>
        <button
          onClick={() => { const v = !voice; setVoice(v); if (!v) stopBotSpeech(); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            voice ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary/40 text-muted-foreground border-border/30"
          }`}
        >
          {voice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {voice ? "Bot reads aloud" : "Silent bot"}
        </button>
      </div>

      {/* Board */}
      <div className="relative rounded-[26px] p-3 md:p-4"
        style={{ background: "linear-gradient(160deg, hsl(30 25% 26%), hsl(28 30% 18%))", boxShadow: "0 26px 60px -28px hsl(var(--glow) / 0.6)" }}>
        <div
          ref={boardRef}
          className="relative rounded-2xl overflow-y-auto min-h-[320px] md:min-h-[420px] max-h-[55vh] p-6 md:p-9"
          style={{
            background: "radial-gradient(120% 120% at 30% 20%, hsl(155 22% 20%), hsl(155 25% 12%))",
            boxShadow: "inset 0 0 70px hsl(0 0% 0% / 0.55)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "repeating-linear-gradient(115deg, hsl(0 0% 100%) 0 1px, transparent 1px 26px)" }} />

          {steps.length === 0 && !loading && (
            <div className="relative text-center py-10">
              <p className="font-display text-2xl md:text-3xl" style={{ color: "hsl(0 0% 95% / 0.9)" }}>Board is clean ✏️</p>
              <p className="text-sm mt-2" style={{ color: "hsl(0 0% 90% / 0.55)" }}>Try one of these:</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => { setQuestion(ex); solve(ex); }}
                    className="px-3 py-1.5 rounded-full text-xs border transition-colors"
                    style={{ color: "hsl(0 0% 95% / 0.85)", borderColor: "hsl(0 0% 100% / 0.25)" }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative space-y-3">
            <AnimatePresence>
              {steps.slice(0, visible).map((line, i) => (
                <motion.p
                  key={`${i}-${line.slice(0, 12)}`}
                  initial={{ opacity: 0, x: -14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.35 }}
                  className="font-display text-lg md:text-2xl leading-relaxed"
                  style={{ color: /^answer/i.test(line) ? "hsl(48 95% 72%)" : "hsl(0 0% 96% / 0.92)", textShadow: "0 0 12px hsl(0 0% 100% / 0.25)" }}
                >
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
            {(loading || visible < steps.length) && (
              <span className="inline-block w-6 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(0 0% 100% / 0.7)" }} />
            )}
          </div>

          {/* chalk tray bot */}
          <div className="pointer-events-none absolute right-1 bottom-0 hidden sm:block">
            <ChalkBot writing={writing} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 surface-card px-4 py-2">
          <PenLine className="w-4 h-4 text-primary shrink-0" />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && solve(question)}
            placeholder="e.g. 248 + 176, or explain long division"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => solve(question)} disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold glow-box disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Ask the Bot
          </button>
          <button onClick={clearBoard}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border/50 text-muted-foreground text-sm hover:text-foreground">
            <Eraser className="w-4 h-4" /> Wipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingBoard;