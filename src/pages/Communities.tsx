import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, MessageSquare, Video, Layers, Search, Crown, LogIn, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ICONS = ["📚", "🔬", "🧮", "🎨", "🌍", "💻", "🎵", "⚽", "🚀", "🧪"];

const Communities = () => {
  const { user, isGuest, profile } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("📚");
  const [newPost, setNewPost] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [postType, setPostType] = useState<"text" | "video">("text");

  useEffect(() => { fetchCommunities(); }, []);
  useEffect(() => { if (user) fetchMemberships(); }, [user]);
  useEffect(() => { if (selectedCommunity) fetchPosts(selectedCommunity.id); }, [selectedCommunity]);

  const fetchCommunities = async () => {
    const { data } = await supabase.from("communities").select("*").order("member_count", { ascending: false });
    if (data) setCommunities(data);
  };

  const fetchMemberships = async () => {
    if (!user) return;
    const { data } = await supabase.from("community_members").select("community_id").eq("user_id", user.id);
    if (data) setMyMemberships(new Set(data.map((m: any) => m.community_id)));
  };

  const fetchPosts = async (communityId: string) => {
    const { data } = await supabase.from("community_posts").select("*").eq("community_id", communityId).order("created_at", { ascending: false }).limit(50);
    if (data) setPosts(data);
  };

  const createCommunity = async () => {
    if (!newName) { toast.error("Name required"); return; }
    if (!user || isGuest) { toast.error("Sign in to create"); return; }
    const { data, error } = await supabase.from("communities").insert({ name: newName, description: newDesc, created_by: user.id, icon: newIcon }).select().single();
    if (error) { toast.error(error.message); return; }
    await supabase.from("community_members").insert({ community_id: data.id, user_id: user.id, role: "admin" });
    toast.success("Community created!");
    setShowCreate(false); setNewName(""); setNewDesc("");
    fetchCommunities(); fetchMemberships();
  };

  const joinCommunity = async (id: string) => {
    if (!user || isGuest) { toast.error("Sign in to join"); return; }
    const { error } = await supabase.from("community_members").insert({ community_id: id, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    await supabase.from("communities").update({ member_count: (communities.find(c => c.id === id)?.member_count || 0) + 1 }).eq("id", id);
    toast.success("Joined!");
    fetchCommunities(); fetchMemberships();
  };

  const leaveCommunity = async (id: string) => {
    if (!user) return;
    await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", user.id);
    await supabase.from("communities").update({ member_count: Math.max((communities.find(c => c.id === id)?.member_count || 1) - 1, 0) }).eq("id", id);
    toast.success("Left community");
    fetchCommunities(); fetchMemberships();
    if (selectedCommunity?.id === id) setSelectedCommunity(null);
  };

  const sendPost = async () => {
    if (!newPost.trim() && !newVideoUrl.trim()) return;
    if (!user || isGuest || !selectedCommunity) { toast.error("Sign in first"); return; }
    const { error } = await supabase.from("community_posts").insert({
      community_id: selectedCommunity.id,
      user_id: user.id,
      content: newPost || newVideoUrl,
      post_type: postType,
      video_url: postType === "video" ? newVideoUrl : null,
    });
    if (error) { toast.error(error.message); return; }
    setNewPost(""); setNewVideoUrl("");
    fetchPosts(selectedCommunity.id);
  };

  const filtered = communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Communities</h2>
          <p className="text-sm text-muted-foreground">{communities.length} communities</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar list */}
        <div className="w-72 shrink-0 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search..." />
          </div>
          {filtered.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => setSelectedCommunity(c)}
              className={`glass rounded-xl p-4 cursor-pointer transition-all hover:neon-border-active ${selectedCommunity?.id === c.id ? "neon-border-active glow-box" : "border border-border/30"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.member_count} members</p>
                </div>
                {myMemberships.has(c.id) ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">Joined</span>
                ) : (
                  <button onClick={e => { e.stopPropagation(); joinCommunity(c.id); }}
                    className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground font-medium">Join</button>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No communities found</p>}
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {selectedCommunity ? (
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCommunity.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{selectedCommunity.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedCommunity.description || "No description"} · {selectedCommunity.member_count} members</p>
                  </div>
                </div>
                {myMemberships.has(selectedCommunity.id) && (
                  <button onClick={() => leaveCommunity(selectedCommunity.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10">Leave</button>
                )}
              </div>

              {/* Posts */}
              <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {posts.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No posts yet. Start the conversation!</p>
                ) : posts.map(p => {
                  const extractYtId = (url: string) => url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1];
                  const ytId = p.video_url ? extractYtId(p.video_url) : null;
                  return (
                    <div key={p.id} className="p-3 rounded-lg bg-secondary/30 border border-border/20">
                      <p className="text-sm text-foreground">{p.content}</p>
                      {ytId && (
                        <div className="mt-2 rounded-lg overflow-hidden aspect-video">
                          <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen />
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Post input */}
              {myMemberships.has(selectedCommunity.id) && (
                <div className="p-4 border-t border-border/30">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setPostType("text")} className={`text-xs px-2 py-1 rounded ${postType === "text" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                      <MessageSquare className="w-3 h-3 inline mr-1" /> Text
                    </button>
                    <button onClick={() => setPostType("video")} className={`text-xs px-2 py-1 rounded ${postType === "video" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                      <Video className="w-3 h-3 inline mr-1" /> Video
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {postType === "text" ? (
                      <input value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Write something..."
                        onKeyDown={e => e.key === "Enter" && sendPost()}
                        className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    ) : (
                      <input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="Paste YouTube URL..."
                        onKeyDown={e => e.key === "Enter" && sendPost()}
                        className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    )}
                    <button onClick={sendPost} className="p-2 rounded-lg bg-primary text-primary-foreground"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a community or create one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass rounded-xl p-6 w-full max-w-md glow-box" onClick={e => e.stopPropagation()}>
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Create Community</h3>
              <div className="space-y-3">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Community name"
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Pick an icon</p>
                  <div className="flex gap-2 flex-wrap">
                    {ICONS.map(ic => (
                      <button key={ic} onClick={() => setNewIcon(ic)}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${newIcon === ic ? "bg-primary/20 neon-border-active" : "bg-secondary/40 border border-border/30"}`}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg border border-border/50 text-muted-foreground text-sm">Cancel</button>
                  <button onClick={createCommunity} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Create</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Communities;
