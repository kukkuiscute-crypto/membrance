import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Trash2, RotateCcw, Pin, PinOff, Layers, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
  pinned: boolean;
  groupId?: string;
}

interface CardGroup {
  id: string;
  mainQuestion: string;
  answerCardId: string;
  cardIds: string[];
}

interface FlashcardsPageProps {
  onFlip: () => void;
  onMaster: () => void;
}

const FlashcardsPage = ({ onFlip, onMaster }: FlashcardsPageProps) => {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("membrance_flashcards");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((c: any) => ({ ...c, pinned: c.pinned ?? false }));
  });
  const [groups, setGroups] = useState<CardGroup[]>(() => {
    const saved = localStorage.getItem("membrance_groups");
    return saved ? JSON.parse(saved) : [];
  });
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [view, setView] = useState<"all" | "pinned" | "groups">("all");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [groupQuestion, setGroupQuestion] = useState("");
  const [groupAnswer, setGroupAnswer] = useState("");
  const [groupSubCards, setGroupSubCards] = useState<string[]>(["", "", "", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("membrance_flashcards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("membrance_groups", JSON.stringify(groups));
  }, [groups]);

  const addCard = () => {
    if (!question.trim() || !answer.trim()) { toast.error("Both fields required"); return; }
    setCards((prev) => [...prev, { id: crypto.randomUUID(), question, answer, mastered: false, pinned: false }]);
    setQuestion(""); setAnswer(""); setShowForm(false);
    toast.success("Card added!");
  };

  const deleteCard = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id));

  const toggleMaster = (id: string) => {
    setCards((prev) => prev.map((c) => {
      if (c.id === id && !c.mastered) { onMaster(); return { ...c, mastered: true }; }
      return c.id === id ? { ...c, mastered: !c.mastered } : c;
    }));
  };

  const togglePin = (id: string) => {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const flipCard = (id: string) => {
    if (flippedId !== id) onFlip();
    setFlippedId(flippedId === id ? null : id);
  };

  const createGroup = () => {
    if (!groupQuestion.trim() || !groupAnswer.trim()) { toast.error("Question and answer required"); return; }
    const validSubs = groupSubCards.filter((s) => s.trim());
    if (validSubs.length < 3) { toast.error("At least 3 sub-cards required"); return; }

    const groupId = crypto.randomUUID();
    const answerCard: Flashcard = { id: crypto.randomUUID(), question: groupAnswer, answer: groupAnswer, mastered: false, pinned: false, groupId };
    const subCards: Flashcard[] = validSubs.map((s) => ({
      id: crypto.randomUUID(), question: s, answer: s, mastered: false, pinned: false, groupId,
    }));
    const allGroupCards = [answerCard, ...subCards];

    setCards((prev) => [...prev, ...allGroupCards]);
    setGroups((prev) => [...prev, {
      id: groupId,
      mainQuestion: groupQuestion,
      answerCardId: answerCard.id,
      cardIds: allGroupCards.map((c) => c.id),
    }]);

    setGroupQuestion(""); setGroupAnswer(""); setGroupSubCards(["", "", "", ""]); setShowGroupForm(false);
    toast.success("Group created!");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          const newCards: Flashcard[] = data.map((d: any) => ({
            id: crypto.randomUUID(), question: d.question || d.front || "", answer: d.answer || d.back || "", mastered: false, pinned: false,
          }));
          setCards((prev) => [...prev, ...newCards]);
          toast.success(`Imported ${newCards.length} cards!`);
        }
      } catch { toast.error("Invalid JSON file"); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const pinnedCards = cards.filter((c) => c.pinned);
  const displayCards = view === "pinned" ? pinnedCards : view === "groups" ? [] : cards.filter((c) => !c.groupId);
  const activeGroupData = activeGroup ? groups.find((g) => g.id === activeGroup) : null;
  const groupCards = activeGroupData ? cards.filter((c) => activeGroupData.cardIds.includes(c.id)) : [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Flashcards</h2>
          <p className="text-sm text-muted-foreground">{cards.length} cards · {cards.filter((c) => c.mastered).length} mastered · {pinnedCards.length} pinned</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/30 text-xs transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <button onClick={() => setShowGroupForm(!showGroupForm)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/30 text-xs transition-all">
            <Layers className="w-3.5 h-3.5" /> Group-per
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow-box-strong">
            <Plus className="w-4 h-4" /> New Card
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border/30">
        {(["all", "pinned", "groups"] as const).map((v) => (
          <button key={v} onClick={() => { setView(v); setActiveGroup(null); }} className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${view === v ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
            {v === "all" ? "All Cards" : v === "pinned" ? `Pinned (${pinnedCards.length})` : `Groups (${groups.length})`}
          </button>
        ))}
      </div>

      {/* New Card Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass rounded-xl p-6 mb-6 glow-box overflow-hidden">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Question</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24" placeholder="What is photosynthesis?" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Answer</label>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24" placeholder="The process by which plants..." />
              </div>
            </div>
            <button onClick={addCard} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium">Add Card</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group-per Form */}
      <AnimatePresence>
        {showGroupForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass rounded-xl p-6 mb-6 glow-box overflow-hidden">
            <h3 className="font-display text-sm font-bold text-foreground mb-4">Create Group-per (Multi-Card Cluster)</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Main Question</label>
                <input value={groupQuestion} onChange={(e) => setGroupQuestion(e.target.value)} className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Main question for the group..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Answer Card</label>
                <input value={groupAnswer} onChange={(e) => setGroupAnswer(e.target.value)} className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="The correct answer..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Supporting/Context Cards (min 3)</label>
                {groupSubCards.map((sc, i) => (
                  <input key={i} value={sc} onChange={(e) => { const n = [...groupSubCards]; n[i] = e.target.value; setGroupSubCards(n); }}
                    className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-1.5"
                    placeholder={`Related fact #${i + 1}`} />
                ))}
                {groupSubCards.length < 10 && (
                  <button onClick={() => setGroupSubCards([...groupSubCards, ""])} className="text-xs text-primary hover:underline">+ Add another</button>
                )}
              </div>
            </div>
            <button onClick={createGroup} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium">Create Group</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups view */}
      {view === "groups" && !activeGroup && (
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center"><p className="text-muted-foreground">No groups yet. Create one with the Group-per button!</p></div>
          ) : groups.map((g) => (
            <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveGroup(g.id)}
              className="glass rounded-xl p-5 cursor-pointer hover:neon-border-active transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">{g.mainQuestion}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g.cardIds.length} cards in cluster</p>
                </div>
                <Layers className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Active Group Detail */}
      {view === "groups" && activeGroup && activeGroupData && (
        <div>
          <button onClick={() => setActiveGroup(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Groups
          </button>
          <div className="glass rounded-xl p-5 mb-4 neon-border-active glow-box">
            <p className="font-display font-bold text-foreground">{activeGroupData.mainQuestion}</p>
            <p className="text-xs text-muted-foreground mt-1">Find the answer among {groupCards.length} cards</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {groupCards.map((card) => (
              <motion.div key={card.id} layout className="relative group" style={{ perspective: "1000px" }}>
                <div onClick={() => flipCard(card.id)} className="cursor-pointer relative h-40 transition-transform duration-500"
                  style={{ transformStyle: "preserve-3d", transform: flippedId === card.id ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className={`absolute inset-0 glass rounded-xl p-4 flex flex-col justify-between ${card.id === activeGroupData.answerCardId ? "neon-border-active" : "border border-border/30"}`}
                    style={{ backfaceVisibility: "hidden" }}>
                    <p className="text-foreground text-sm">{card.question}</p>
                    <span className="text-xs text-muted-foreground">Tap to reveal</span>
                  </div>
                  <div className="absolute inset-0 glass rounded-xl p-4 flex flex-col justify-between bg-primary/5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <p className="text-foreground text-sm">{card.answer}</p>
                    {card.id === activeGroupData.answerCardId && <span className="text-xs text-primary font-bold">ANSWER</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Pinned Cards Wall */}
      {view === "pinned" && (
        pinnedCards.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center"><p className="text-muted-foreground">No pinned cards. Pin cards with the pin icon!</p></div>
        ) : (
          <div className="relative min-h-[400px] rounded-xl p-6" style={{ background: "linear-gradient(180deg, hsl(var(--secondary) / 0.3), hsl(var(--background)))" }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pinnedCards.map((card, i) => (
                <motion.div key={card.id} initial={{ opacity: 0, y: -20, rotate: -5 + Math.random() * 10 }}
                  animate={{ opacity: 1, y: 0, rotate: -3 + (i % 3) * 3 }}
                  className="relative">
                  <Pin className="w-4 h-4 text-primary absolute -top-1 left-1/2 -translate-x-1/2 z-10 drop-shadow-lg" />
                  <div className="glass rounded-lg p-4 pt-5 shadow-lg" style={{ borderTop: `3px solid hsl(var(--primary) / 0.6)` }}>
                    <p className="text-foreground text-sm font-medium">{card.question}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{card.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Standard Cards Grid */}
      {view === "all" && (
        displayCards.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center"><p className="text-muted-foreground">No flashcards yet. Create one or upload a JSON file!</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCards.map((card) => (
              <motion.div key={card.id} layout className="relative group" style={{ perspective: "1000px" }}>
                <div onClick={() => flipCard(card.id)} className="cursor-pointer relative h-48 transition-transform duration-500"
                  style={{ transformStyle: "preserve-3d", transform: flippedId === card.id ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className={`absolute inset-0 glass rounded-xl p-5 flex flex-col justify-between ${card.mastered ? "neon-border-active" : "border border-border/30"}`}
                    style={{ backfaceVisibility: "hidden" }}>
                    <p className="text-foreground text-sm font-medium">{card.question}</p>
                    <span className="text-xs text-muted-foreground">Click to flip</span>
                  </div>
                  <div className="absolute inset-0 glass rounded-xl p-5 flex flex-col justify-between bg-primary/5"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <p className="text-foreground text-sm">{card.answer}</p>
                    <span className="text-xs text-primary">Answer</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(e) => { e.stopPropagation(); togglePin(card.id); }}
                    className={`p-1.5 rounded-md transition-all ${card.pinned ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground hover:text-foreground"}`}
                    title={card.pinned ? "Unpin" : "Pin"}>
                    {card.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleMaster(card.id); }}
                    className={`p-1.5 rounded-md transition-all ${card.mastered ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground hover:text-foreground"}`}
                    title={card.mastered ? "Unmaster" : "Master"}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                    className="p-1.5 rounded-md bg-secondary/60 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default FlashcardsPage;
