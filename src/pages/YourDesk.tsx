import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Trash2, BookOpen, PenLine, Download, MessageSquare, Layers, Link, Video, FolderOpen, ArrowDown, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Note {
  id: string;
  content: string;
  color: number;
  createdAt: string;
}

interface SavedUrl {
  id: string;
  url: string;
  title: string;
  savedAt: string;
}

const NOTE_COLORS = [
  "45 93% 47%",
  "174 72% 45%",
  "217 91% 60%",
  "350 80% 60%",
  "142 71% 45%",
  "262 83% 65%",
];

const YourDesk = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("membrance_notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>(() => {
    const saved = localStorage.getItem("membrance_saved_urls");
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"sticky" | "book">(() => {
    return (localStorage.getItem("membrance_note_view") as "sticky" | "book") || "sticky";
  });
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [newUrlTitle, setNewUrlTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [aiChats, setAiChats] = useState<any[]>([]);
  const [watchHistory] = useState<any[]>(() => JSON.parse(localStorage.getItem("membrance_watch_history") || "[]"));

  useEffect(() => { localStorage.setItem("membrance_notes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem("membrance_note_view", viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem("membrance_saved_urls", JSON.stringify(savedUrls)); }, [savedUrls]);

  // Fetch AI chats
  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        const { data } = await supabase.from("ai_chats").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(50);
        if (data) setAiChats(data);
      } else {
        const local = JSON.parse(localStorage.getItem("membrance_ai_chats") || "[]");
        setAiChats(local);
      }
    };
    loadChats();
  }, [user]);

  const addNote = () => {
    const newNote: Note = { id: crypto.randomUUID(), content: "", color: Math.floor(Math.random() * NOTE_COLORS.length), createdAt: new Date().toISOString() };
    setNotes((prev) => [newNote, ...prev]);
    setEditingId(newNote.id);
    toast.success("New note created!");
  };

  const updateNote = (id: string, content: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  const deleteNote = (id: string) => { setNotes(prev => prev.filter(n => n.id !== id)); if (editingId === id) setEditingId(null); };

  const addSavedUrl = () => {
    if (!newUrl || !newUrlTitle) { toast.error("Fill in both fields"); return; }
    setSavedUrls(prev => [{ id: crypto.randomUUID(), url: newUrl, title: newUrlTitle, savedAt: new Date().toISOString() }, ...prev]);
    setNewUrl(""); setNewUrlTitle(""); setShowAddUrl(false);
    toast.success("URL saved!");
  };

  const deleteAiChat = async (chatId: string) => {
    if (user) {
      await supabase.from("ai_chats").delete().eq("id", chatId);
    } else {
      const updated = aiChats.filter(c => c.id !== chatId);
      localStorage.setItem("membrance_ai_chats", JSON.stringify(updated));
    }
    setAiChats(prev => prev.filter(c => c.id !== chatId));
    toast.success("Chat deleted");
  };

  const savedFlashcards = JSON.parse(localStorage.getItem("membrance_flashcards") || "[]");

  const scrollToDesk = () => {
    document.getElementById("desk-folders")?.scrollIntoView({ behavior: "smooth" });
  };

  const folders = [
    { id: "notes", icon: StickyNote, label: "Notes", count: notes.length, color: "45 93% 47%" },
    { id: "flashcards", icon: Layers, label: "Flashcards", count: savedFlashcards.length, color: "217 91% 60%" },
    { id: "videos", icon: Video, label: "Watch History", count: watchHistory.length, color: "350 80% 60%" },
    { id: "urls", icon: Link, label: "Saved URLs", count: savedUrls.length, color: "142 71% 45%" },
    { id: "chats", icon: MessageSquare, label: "AI Chats", count: aiChats.length, color: "262 83% 65%" },
    { id: "downloads", icon: Download, label: "Downloads", count: 0, color: "174 72% 45%" },
  ];

  return (
    <div className="flex flex-col min-h-full relative">
      {/* Wall area */}
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
              <h2 className="font-display text-2xl font-bold text-foreground">Your Desk</h2>
              <p className="text-sm text-muted-foreground">{notes.length} notes on the wall</p>
            </div>
            <div className="flex gap-2">
              <button onClick={scrollToDesk}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 text-xs font-medium hover:bg-primary/25 transition-all">
                <ArrowDown className="w-3.5 h-3.5" /> Open Desk
              </button>
              <button onClick={() => setViewMode(viewMode === "sticky" ? "book" : "sticky")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/30 text-xs transition-all">
                {viewMode === "sticky" ? <BookOpen className="w-3.5 h-3.5" /> : <StickyNote className="w-3.5 h-3.5" />}
                {viewMode === "sticky" ? "Book View" : "Sticky View"}
              </button>
              <button onClick={addNote}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                <Plus className="w-3.5 h-3.5" /> New Note
              </button>
            </div>
          </div>

          {viewMode === "sticky" ? (
            <div>
              {notes.length === 0 ? (
                <div className="text-center py-20">
                  <StickyNote className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">No notes yet. Click "New Note" to add one!</p>
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
            <div className="glass rounded-xl overflow-hidden">
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

      {/* Desk Folders Section */}
      <div id="desk-folders" className="border-t border-border/30 bg-secondary/20 p-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" /> Desk Folders
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {folders.map(f => (
              <button key={f.id} onClick={() => setActiveFolder(activeFolder === f.id ? null : f.id)}
                className={`glass rounded-xl p-4 text-center transition-all hover:scale-105 ${activeFolder === f.id ? "neon-border-active glow-box" : "border border-border/30"}`}>
                <f.icon className="w-6 h-6 mx-auto mb-2" style={{ color: `hsl(${f.color})` }} />
                <p className="text-xs font-medium text-foreground">{f.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.count} items</p>
              </button>
            ))}
          </div>

          {/* Folder Content */}
          <AnimatePresence>
            {activeFolder === "urls" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground">Saved URLs</h4>
                  <button onClick={() => setShowAddUrl(!showAddUrl)} className="flex items-center gap-1 px-2 py-1 rounded bg-primary/15 text-primary text-xs"><Plus className="w-3 h-3" /> Add</button>
                </div>
                {showAddUrl && (
                  <div className="flex gap-2 mb-3">
                    <input value={newUrlTitle} onChange={e => setNewUrlTitle(e.target.value)} placeholder="Title" className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-xs" />
                    <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-xs" />
                    <button onClick={addSavedUrl} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs">Save</button>
                  </div>
                )}
                {savedUrls.length === 0 ? <p className="text-xs text-muted-foreground">No saved URLs</p> : (
                  <div className="space-y-1">
                    {savedUrls.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/40">
                        <a href={u.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate">{u.title}</a>
                        <button onClick={() => setSavedUrls(prev => prev.filter(x => x.id !== u.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            {activeFolder === "notes" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-4">
                <p className="text-xs text-muted-foreground">{notes.length} notes — displayed on wall above</p>
              </motion.div>
            )}
            {activeFolder === "flashcards" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-4">
                <p className="text-xs text-muted-foreground">{savedFlashcards.length} flashcards saved</p>
              </motion.div>
            )}
            {activeFolder === "videos" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-4 overflow-hidden">
                <h4 className="text-sm font-medium text-foreground mb-3">Watch History</h4>
                {watchHistory.length === 0 ? <p className="text-xs text-muted-foreground">No watch history yet</p> : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {watchHistory.map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40">
                        <img src={`https://img.youtube.com/vi/${v.youtubeId}/default.jpg`} alt="" className="w-16 h-9 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{v.title}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(v.watchedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            {activeFolder === "chats" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-4 overflow-hidden">
                <h4 className="text-sm font-medium text-foreground mb-3">Saved AI Chats</h4>
                {aiChats.length === 0 ? <p className="text-xs text-muted-foreground">No saved chats yet. Use the save button in AI Tools panel.</p> : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {aiChats.map((chat: any) => (
                      <div key={chat.id} className="p-3 rounded-lg bg-secondary/30 border border-border/20 group">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-foreground truncate">{chat.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{chat.assistant}</span>
                            <button onClick={() => deleteAiChat(chat.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{new Date(chat.created_at || chat.updated_at).toLocaleDateString()} · {(chat.messages as any[])?.length || 0} messages</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            {activeFolder === "downloads" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default YourDesk;
