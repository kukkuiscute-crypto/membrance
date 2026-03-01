import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Trash2, BookOpen, X, PenLine } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  color: number;
  createdAt: string;
}

const NOTE_COLORS = [
  "45 93% 47%",   // gold
  "174 72% 45%",  // teal
  "217 91% 60%",  // blue
  "350 80% 60%",  // rose
  "142 71% 45%",  // green
  "262 83% 65%",  // purple
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

  useEffect(() => {
    localStorage.setItem("membrance_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("membrance_note_view", viewMode);
  }, [viewMode]);

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: "",
      color: Math.floor(Math.random() * NOTE_COLORS.length),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setEditingId(newNote.id);
    toast.success("New note created!");
  };

  const updateNote = (id: string, content: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, content } : n));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Study Notes</h2>
          <p className="text-sm text-muted-foreground">{notes.length} notes</p>
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
        /* Sticky Notes Wall + Desk */
        <div>
          {/* Notes wall */}
          <div className="min-h-[300px] rounded-xl p-6 mb-4" style={{ background: "linear-gradient(180deg, hsl(var(--secondary) / 0.2), hsl(var(--background)))" }}>
            {notes.length === 0 ? (
              <div className="text-center py-16">
                <StickyNote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No notes yet. Click the desk below to create one!</p>
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
                          style={{
                            background: `linear-gradient(135deg, hsl(${color} / 0.15), hsl(${color} / 0.05))`,
                            borderLeft: `3px solid hsl(${color} / 0.6)`,
                          }}>
                          {editingId === note.id ? (
                            <div>
                              <textarea value={note.content} onChange={(e) => updateNote(note.id, e.target.value)}
                                autoFocus onBlur={() => setEditingId(null)}
                                className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none min-h-[100px]"
                                placeholder="Type your note..." />
                            </div>
                          ) : (
                            <div onClick={() => setEditingId(note.id)} className="cursor-pointer min-h-[100px]">
                              <p className="text-foreground text-sm whitespace-pre-wrap">{note.content || "Click to edit..."}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingId(note.id)} className="p-1 rounded bg-secondary/80 text-muted-foreground hover:text-foreground">
                            <PenLine className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteNote(note.id)} className="p-1 rounded bg-secondary/80 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* 3D Desk */}
          <motion.div onClick={addNote} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="cursor-pointer rounded-xl p-6 text-center transition-all border border-border/30"
            style={{
              background: "linear-gradient(180deg, hsl(var(--secondary) / 0.6), hsl(var(--secondary) / 0.3))",
              boxShadow: "0 8px 32px hsl(var(--background) / 0.5), inset 0 1px 0 hsl(var(--foreground) / 0.05)",
              transform: "perspective(800px) rotateX(2deg)",
            }}>
            <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">Click desk to add a new note</p>
          </motion.div>
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
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm">No notes yet.</p>
              </div>
            ) : notes.map((note) => {
              const color = NOTE_COLORS[note.color];
              return (
                <div key={note.id} className="flex group">
                  {/* Margin indicator */}
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
                      <button onClick={() => deleteNote(note.id)} className="p-1 rounded bg-secondary/60 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyNotes;
