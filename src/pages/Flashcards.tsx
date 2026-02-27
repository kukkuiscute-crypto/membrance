import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
}

interface FlashcardsPageProps {
  onFlip: () => void;
  onMaster: () => void;
}

const FlashcardsPage = ({ onFlip, onMaster }: FlashcardsPageProps) => {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("membrance_flashcards");
    return saved ? JSON.parse(saved) : [];
  });
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("membrance_flashcards", JSON.stringify(cards));
  }, [cards]);

  const addCard = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Both fields required");
      return;
    }
    setCards((prev) => [...prev, { id: crypto.randomUUID(), question, answer, mastered: false }]);
    setQuestion("");
    setAnswer("");
    setShowForm(false);
    toast.success("Card added!");
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleMaster = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.mastered) {
          onMaster();
          return { ...c, mastered: true };
        }
        return c.id === id ? { ...c, mastered: !c.mastered } : c;
      })
    );
  };

  const flipCard = (id: string) => {
    if (flippedId !== id) onFlip();
    setFlippedId(flippedId === id ? null : id);
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
            id: crypto.randomUUID(),
            question: d.question || d.front || "",
            answer: d.answer || d.back || "",
            mastered: false,
          }));
          setCards((prev) => [...prev, ...newCards]);
          toast.success(`Imported ${newCards.length} cards!`);
        }
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Flashcards</h2>
          <p className="text-sm text-muted-foreground">{cards.length} cards · {cards.filter((c) => c.mastered).length} mastered</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/30 text-sm transition-all"
          >
            <Upload className="w-4 h-4" /> Upload JSON
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow-box-strong"
          >
            <Plus className="w-4 h-4" /> New Card
          </button>
        </div>
      </div>

      {/* New card form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-6 mb-6 glow-box overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Question (Front)</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                  placeholder="What is photosynthesis?"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Answer (Back)</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                  placeholder="The process by which plants..."
                />
              </div>
            </div>
            <button onClick={addCard} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium">
              Add Card
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards grid */}
      {cards.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No flashcards yet. Create one or upload a JSON file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              className="relative group"
              style={{ perspective: "1000px" }}
            >
              <div
                onClick={() => flipCard(card.id)}
                className="cursor-pointer relative h-48 transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flippedId === card.id ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 glass rounded-xl p-5 flex flex-col justify-between ${
                    card.mastered ? "neon-border-active" : "border border-border/30"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-foreground text-sm font-medium">{card.question}</p>
                  <span className="text-xs text-muted-foreground">Click to flip</span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 glass rounded-xl p-5 flex flex-col justify-between bg-primary/5"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="text-foreground text-sm">{card.answer}</p>
                  <span className="text-xs text-primary">Answer</span>
                </div>
              </div>
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMaster(card.id); }}
                  className={`p-1.5 rounded-md transition-all ${card.mastered ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground hover:text-foreground"}`}
                  title={card.mastered ? "Unmaster" : "Mark as mastered"}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                  className="p-1.5 rounded-md bg-secondary/60 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
