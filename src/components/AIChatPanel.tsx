import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { streamAiResponse } from "@/lib/aiStream";

type Msg = { role: "user" | "assistant"; content: string };

interface AIChatPanelProps {
  functionName: string;
  placeholder: string;
}

const AIChatPanel = ({ functionName, placeholder }: AIChatPanelProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      await streamAiResponse(functionName, allMessages, (_delta, fullText) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") return prev.map((message, index) => index === prev.length - 1 ? { ...message, content: fullText } : message);
          return [...prev, { role: "assistant", content: fullText }];
        });
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const saveChat = async () => {
    if (messages.length === 0) { toast.error("No messages to save"); return; }
    if (!user) {
      // Save to localStorage for guests/lite
      const existing = JSON.parse(localStorage.getItem("membrance_ai_chats") || "[]");
      const title = messages[0]?.content?.slice(0, 50) || "Chat";
      existing.unshift({ id: crypto.randomUUID(), title, messages, assistant: functionName, created_at: new Date().toISOString() });
      localStorage.setItem("membrance_ai_chats", JSON.stringify(existing.slice(0, 50)));
      toast.success("Chat saved to your Desk!");
      return;
    }
    const title = messages[0]?.content?.slice(0, 50) || "Chat";
    const { error } = await supabase.from("ai_chats").insert({
      user_id: user.id, title, messages: messages as any, assistant: functionName,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Chat saved to your Desk!");
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Start a conversation...</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-foreground border border-border/30"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-secondary/60 border border-border/30 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border/30">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={placeholder}
            className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {messages.length > 0 && (
            <button onClick={saveChat} title="Save chat to Desk"
              className="p-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-primary border border-border/30 transition-colors">
              <Save className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
