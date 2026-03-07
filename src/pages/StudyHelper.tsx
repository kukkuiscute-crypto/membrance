import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Camera, Highlighter, Key, MessageSquare, Send, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudyHelper = () => {
  const { user, isGuest } = useAuth();
  const [mode, setMode] = useState<"revise" | "quiz">("revise");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [keypoints, setKeypoints] = useState<string[]>([]);

  const isLoggedIn = !!user && !isGuest;

  const askAI = async (prompt: string) => {
    if (!isLoggedIn) { toast.error("Sign in to use Study Helper"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("amber-ai", {
        body: { messages: [{ role: "user", content: prompt }] },
      });
      if (error) throw error;
      const text = data?.reply || data?.choices?.[0]?.message?.content || "No response";
      setResponse(text);
      // Extract keypoints from bullet points
      const lines = text.split("\n").filter((l: string) => l.trim().startsWith("-") || l.trim().startsWith("•") || l.trim().match(/^\d+\./));
      if (lines.length > 0) setKeypoints(lines.map((l: string) => l.replace(/^[-•\d.]+\s*/, "").trim()));
    } catch (err: any) {
      toast.error("Failed to get response");
    }
    setLoading(false);
  };

  const handleRevise = () => {
    if (!input.trim()) { toast.error("Enter text or describe the chapter to revise"); return; }
    askAI(`You are a study helper. The student wants to revise the following content. Provide clear key points, a summary, and important highlights. Format with bullet points.\n\nContent:\n${input}`);
  };

  const handleQuiz = () => {
    if (!input.trim()) { toast.error("Enter a topic for the quiz"); return; }
    askAI(`You are a study helper. Generate 5 quick revision questions about the following topic. Include the answers after each question.\n\nTopic: ${input}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-xl p-12 text-center max-w-md">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Study Helper</h3>
          <p className="text-sm text-muted-foreground">Sign in with a username to use the Study Helper.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Study Helper</h2>
          <p className="text-sm text-muted-foreground">Paste text, describe a chapter, or type notes to revise</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("revise")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${mode === "revise" ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
          <Highlighter className="w-3.5 h-3.5" /> Revise & Keypoints
        </button>
        <button onClick={() => setMode("quiz")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${mode === "quiz" ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
          <MessageSquare className="w-3.5 h-3.5" /> Quick Quiz
        </button>
      </div>

      {/* Input */}
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          {mode === "revise"
            ? "Paste the text from your book, or describe the chapter you want to revise:"
            : "Enter a topic to generate revision questions:"}
        </p>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          rows={6} placeholder={mode === "revise" ? "Paste chapter text here, or type 'Chapter 5: Photosynthesis from Class 10 Biology'..." : "e.g. Photosynthesis, Newton's Laws, French Revolution..."}
          className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
        <div className="flex items-center gap-2 mt-3">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Camera className="w-3 h-3" /> Tip: You can also screenshot a page and describe what's on it
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={mode === "revise" ? handleRevise : handleQuiz} disabled={loading}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Thinking..." : mode === "revise" ? "Get Key Points & Summary" : "Generate Quiz"}
        </motion.button>
      </div>

      {/* Response */}
      {response && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {keypoints.length > 0 && mode === "revise" && (
            <div className="glass rounded-xl p-4 glow-box">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Key Points</p>
              </div>
              <div className="space-y-1.5">
                {keypoints.map((kp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary text-xs mt-0.5">•</span>
                    <p className="text-sm text-foreground">{kp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Full Response</p>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudyHelper;
