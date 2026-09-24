import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Eraser, Lock, Volume2, VolumeX, PenLine, Sparkles, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { botSpeak, isBotVoiceOn, setBotVoice, stopBotSpeech } from "@/lib/botVoice";
import { streamAiResponse } from "@/lib/aiStream";
import { Button } from "@/components/ui/button";

const EXAMPLES = ["12 + 47", "3/4 + 5/6", "2x + 5 = 17", "Area of a circle with r = 7", "15% of 240"];

type BoardPhase = "idle" | "thinking" | "writing" | "done" | "error";

const WritingBoard = () => {
  const { user, isGuest } = useAuth();
  const isLoggedIn = !!user && !isGuest;
  const [question, setQuestion] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [visible, setVisible] = useState(0);
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(isBotVoiceOn());
  const [phase, setPhase] = useState<BoardPhase>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  const writing = loading || visible < steps.length;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("membrance:board-state", { detail: { phase, question } }));
    return () => window.dispatchEvent(new CustomEvent("membrance:board-state", { detail: { phase: "idle", question: "" } }));
  }, [phase, question]);

  // Reveal each chalk line one after another, like real board work.
  useEffect(() => {
    if (visible >= steps.length) return;
    timerRef.current = window.setTimeout(() => {
      setVisible((v) => {
        const next = v + 1;
        if (voice && steps[v]) botSpeak(steps[v]);
        if (next >= steps.length) setPhase("done");
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
    setPhase("thinking");
    setErrorMessage("");
    setSteps([]);
    setVisible(0);
    try {
      const text = await streamAiResponse("amber-ai", [{
        role: "user",
        content:
          `Solve this for a school student: ${q}\n` +
          `Return only short chalkboard lines. Begin each explanation line with "Step 1:", "Step 2:", and so on. ` +
          `Keep each line under 14 words and finish with "Answer: ...".`,
      }]);
      const lines = text
        .split("\n")
        .map((l) => l.replace(/^[*\-•]\s*/, "").replace(/[*#`]/g, "").trim())
        .filter(Boolean);
      if (!lines.length) throw new Error("empty");
      setSteps(lines);
      setPhase("writing");
    } catch (error) {
      const safeMessage = error instanceof Error ? error.message : "The Helper Bot could not finish this answer.";
      setErrorMessage(safeMessage);
      setPhase("error");
      toast.error(safeMessage);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const clearBoard = () => {
    stopBotSpeech();
    setSteps([]);
    setVisible(0);
    setQuestion("");
    setErrorMessage("");
    setPhase("idle");
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5" data-writing-board>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient">AI Writing Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Ask anything — the Helper Bot grabs a chalk and works it out step by step.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { const v = !voice; setVoice(v); setBotVoice(v); if (!v) stopBotSpeech(); }} className={voice ? "text-primary border-primary/40 bg-primary/10" : "text-muted-foreground"}>
          {voice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {voice ? "Bot reads aloud" : "Silent bot"}
        </Button>
      </div>

      {/* Board */}
      <div className="relative rounded-2xl border border-primary/20 bg-card/70 p-2 md:p-3 shadow-2xl">
        <div
          ref={boardRef}
          className="writing-board-surface relative rounded-xl overflow-y-auto min-h-[340px] md:min-h-[440px] max-h-[58vh] p-6 md:p-10"
        >
          <div className="writing-board-grain pointer-events-none absolute inset-0" />

          {steps.length === 0 && !loading && (
            <div className="relative text-center py-10">
              <Sparkles className="w-8 h-8 text-board-foreground/70 mx-auto mb-3" />
              <p className="font-display text-2xl md:text-3xl text-board-foreground">Ready for a problem</p>
              <p className="text-sm mt-2 text-board-muted">Choose an example or write your own.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {EXAMPLES.map((ex) => (
                  <Button key={ex} variant="outline" size="sm" onClick={() => { setQuestion(ex); solve(ex); }} className="h-8 border-board-foreground/20 bg-board-foreground/5 text-board-foreground hover:bg-board-foreground/10 hover:text-board-foreground">
                    {ex}
                  </Button>
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
                  className={`font-display text-lg md:text-2xl leading-relaxed ${/^answer/i.test(line) ? "text-board-answer" : "text-board-foreground"}`}
                >
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
            {(loading || visible < steps.length) && (
              <div className="flex items-center gap-2 text-board-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> {loading ? "Thinking through it…" : "Writing the next step…"}</div>
            )}
          </div>
          {errorMessage && <div className="relative mt-6 max-w-xl rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-board-foreground">{errorMessage}</div>}
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
          <Button onClick={() => solve(question)} disabled={loading} className="h-12 px-5 glow-box">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Ask the Bot
          </Button>
          <Button onClick={phase === "error" ? () => solve(question) : clearBoard} variant="outline" className="h-12 px-4">
            {phase === "error" ? <RotateCcw className="w-4 h-4" /> : <Eraser className="w-4 h-4" />} {phase === "error" ? "Retry" : "Wipe"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WritingBoard;