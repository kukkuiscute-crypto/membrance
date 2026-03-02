import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Trash2, BookOpen, PenLine, ChevronUp, ChevronDown, Download, MessageSquare, Layers, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  color: number;
  createdAt: string;
}

const NOTE_COLORS = [
  "45 93% 47%",
  "174 72% 45%",
  "217 91% 60%",
  "350 80% 60%",
  "142 71% 45%",
  "262 83% 65%",
];

const StudyNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("membrance_notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"sticky" | "book">(() => {
    return (localStorage.getItem("membrance_note_view") as "sticky" | "book") || "sticky";
  });
  const [deskExpanded, setDeskExpanded] = useState(false);

  useEffect(() => { localStorage.setItem("membrance_notes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem("membrance_note_view", viewMode); }, [viewMode]);

  const addNote = () => {
    const newNote: Note = { id: crypto.randomUUID(), content: "", color: Math.floor(Math.random() * NOTE_COLORS.length), createdAt: new Date().toISOString() };
    setNotes((prev) => [newNote, ...prev]);
    setEditingId(newNote.id);
    toast.success("New note created!");
  };

  const updateNote = (id: string, content: string) => { setNotes((prev) => prev.map((n) => n.id === id ? { ...n, content } : n)); };
  const deleteNote = (id: string) => { setNotes((prev) => prev.filter((n) => n.id !== id)); if (editingId === id) setEditingId(null); };

  // Saved items from localStorage
  const savedFlashcards = JSON.parse(localStorage.getItem("membrance_flashcards") || "[]");
  const pinnedNotes = notes.filter(n => n.content.trim());

  return (
    <div className="flex flex-col h-full relative">
      {/* Brick Wall Background */}
      <div className="flex-1 overflow-y-auto relative" style={{
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 48px, hsl(var(--border) / 0.15) 48px, hsl(var(--border) / 0.15) 50px),
          repeating-linear-gradient(0deg, transparent, transparent 23px, hsl(var(--border) / 0.12) 23px, hsl(var(--border) / 0.12) 25px)
        `,
        backgroundColor: `hsl(var(--background))`,
      }}>
        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Study Notes</h2>
              <p className="text-sm text-muted-foreground">{notes.length} notes on the wall</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode(viewMode === "sticky" ? "book" : "sticky")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/30 text-xs transition-all">
                {viewMode === "sticky" ? <BookOpen className="w-3.5 h-3.5" /> : <StickyNote className="w-3.5 h-3.5" />}
                {viewMode === "sticky" ? "Book View" : "Sticky View"}
              </button>
            </div>
          </div>

          {viewMode === "sticky" ? (
            <div>
              {notes.length === 0 ? (
                <div className="text-center py-20">
                  <StickyNote className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No notes yet. Hover over the desk below to add one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {notes.map((note, i) => {
                      const color = NOTE_COLORS[note.color];
                      return (
                        <motion.div key={note.id}
                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                          animate={{ opacity: 1, scale: 1, rotate: -2 + (i % 5) * 1.5 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="relative group">
                          <div className="rounded-lg p-4 min-h-[140px] shadow-lg"
                            style={{ background: `linear-gradient(135deg, hsl(${color} / 0.15), hsl(${color} / 0.05))`, borderLeft: `3px solid hsl(${color} / 0.6)` }}>
                            {editingId === note.id ? (
                              <textarea value={note.content} onChange={(e) => updateNote(note.id, e.target.value)}
                                autoFocus onBlur={() => setEditingId(null)}
                                className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none min-h-[100px]"
                                placeholder="Type your note..." />
                            ) : (
                              <div onClick={() => setEditingId(note.id)} className="cursor-pointer min-h-[100px]">
                                <p className="text-foreground text-sm whitespace-pre-wrap">{note.content || "Click to edit..."}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingId(note.id)} className="p-1 rounded bg-secondary/80 text-muted-foreground hover:text-foreground"><PenLine className="w-3 h-3" /></button>
                            <button onClick={() => deleteNote(note.id)} className="p-1 rounded bg-secondary/80 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            /* Book Notes View */
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-foreground">Notebook</h3>
                  <button onClick={addNote} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                    <Plus className="w-3.5 h-3.5" /> New Note
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border/20">
                {notes.length === 0 ? (
                  <div className="p-12 text-center"><p className="text-muted-foreground text-sm">No notes yet.</p></div>
                ) : notes.map((note) => {
                  const color = NOTE_COLORS[note.color];
                  return (
                    <div key={note.id} className="flex group">
                      <div className="w-1 shrink-0" style={{ background: `hsl(${color} / 0.5)` }} />
                      <div className="w-12 shrink-0 border-r border-border/20 flex items-start justify-center pt-4">
                        <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="flex-1 p-4 relative">
                        {editingId === note.id ? (
                          <textarea value={note.content} onChange={(e) => updateNote(note.id, e.target.value)}
                            autoFocus onBlur={() => setEditingId(null)}
                            className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none min-h-[60px] leading-relaxed"
                            placeholder="Type your note..." />
                        ) : (
                          <p onClick={() => setEditingId(note.id)} className="text-foreground text-sm cursor-pointer leading-relaxed whitespace-pre-wrap">
                            {note.content || "Click to edit..."}
                          </p>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => deleteNote(note.id)} className="p-1 rounded bg-secondary/60 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3D Study Desk */}
      <motion.div
        onHoverStart={() => setDeskExpanded(true)}
        onHoverEnd={() => setDeskExpanded(false)}
        animate={{ height: deskExpanded ? 280 : 64 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative shrink-0 border-t border-border/30 overflow-hidden cursor-pointer"
        style={{
          background: "linear-gradient(180deg, hsl(var(--secondary) / 0.8), hsl(var(--secondary) / 0.4))",
          boxShadow: "0 -8px 32px hsl(var(--background) / 0.5), inset 0 2px 0 hsl(var(--foreground) / 0.03)",
        }}
        onClick={() => { if (!deskExpanded) addNote(); }}
      >
        {/* Desk top edge */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.2))" }} />

        {/* Collapsed state */}
        {!deskExpanded && (
          <div className="flex items-center justify-center gap-3 h-full">
            <ChevronUp className="w-4 h-4 text-muted-foreground animate-bounce" />
            <p className="text-sm text-muted-foreground font-medium">Hover to open desk · Click to add note</p>
          </div>
        )}

        {/* Expanded desk contents */}
        {deskExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-foreground">Study Desk</h3>
              <button onClick={(e) => { e.stopPropagation(); addNote(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                <Plus className="w-3 h-3" /> New Note
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* Pinned Notes */}
              <div className="glass rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Pinned Notes</span>
                </div>
                <p className="text-xs text-muted-foreground">{pinnedNotes.length} notes</p>
              </div>

              {/* Saved Flashcards */}
              <div className="glass rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Flashcards</span>
                </div>
                <p className="text-xs text-muted-foreground">{savedFlashcards.length} cards</p>
              </div>

              {/* AI Chat History */}
              <div className="glass rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">AI Chats</span>
                </div>
                <p className="text-xs text-muted-foreground">Amber & Miraco</p>
              </div>

              {/* Downloads */}
              <div className="glass rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Downloads</span>
                </div>
                <p className="text-xs text-muted-foreground">Books & files</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">Move mouse away to collapse desk</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StudyNotes;
