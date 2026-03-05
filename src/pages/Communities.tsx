import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, X, Send, CheckCircle, Hammer, Lock, Globe, Bell, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ICONS = ["📚", "🔬", "🧮", "🎨", "🌍", "💻", "🎵", "⚽", "🚀", "🧪"];
const VERIFIED_USERS = ["kukkuiscute"];

const Communities = () => {
  const { user, isGuest, profile } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Map<string, string>>(new Map());
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("📚");
  const [newJoinMode, setNewJoinMode] = useState<"open" | "request">("open");
  const [msgText, setMsgText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [myPendingRequests, setMyPendingRequests] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchCommunities(); }, []);
  useEffect(() => { if (user) { fetchMemberships(); fetchMyPendingRequests(); } }, [user]);
  useEffect(() => { if (selectedCommunity) { fetchMessages(selectedCommunity.id); if (myMemberships.get(selectedCommunity.id) === "admin") fetchJoinRequests(selectedCommunity.id); } }, [selectedCommunity]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Realtime messages
  useEffect(() => {
    if (!selectedCommunity) return;
    const channel = supabase.channel(`chat-${selectedCommunity.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages", filter: `community_id=eq.${selectedCommunity.id}` },
        (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedCommunity]);

  const fetchCommunities = async () => {
    const { data } = await supabase.from("communities").select("*").order("member_count", { ascending: false });
    if (data) setCommunities(data);
  };

  const fetchMemberships = async () => {
    if (!user) return;
    const { data } = await supabase.from("community_members").select("community_id, role").eq("user_id", user.id);
    if (data) setMyMemberships(new Map(data.map((m: any) => [m.community_id, m.role])));
  };

  const fetchMyPendingRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from("community_join_requests").select("community_id").eq("user_id", user.id).eq("status", "pending");
    if (data) setMyPendingRequests(new Set(data.map((r: any) => r.community_id)));
  };

  const fetchJoinRequests = async (communityId: string) => {
    const { data } = await supabase.from("community_join_requests").select("*").eq("community_id", communityId).eq("status", "pending");
    if (data) setJoinRequests(data);
  };

  const fetchMessages = async (communityId: string) => {
    const { data } = await supabase.from("community_messages").select("*").eq("community_id", communityId).order("created_at", { ascending: true }).limit(100);
    if (data) setMessages(data);
  };

  const createCommunity = async () => {
    if (!newName) { toast.error("Name required"); return; }
    if (!user) { toast.error("Sign in to create"); return; }
    const { data, error } = await supabase.from("communities").insert({ name: newName, description: newDesc, created_by: user.id, icon: newIcon, join_mode: newJoinMode }).select().single();
    if (error) { toast.error(error.message); return; }
    await supabase.from("community_members").insert({ community_id: data.id, user_id: user.id, role: "admin" });
    toast.success("Community created!"); setShowCreate(false); setNewName(""); setNewDesc("");
    fetchCommunities(); fetchMemberships();
  };

  const joinCommunity = async (community: any) => {
    if (!user) { toast.error("Sign in to join"); return; }
    if (community.join_mode === "request") {
      const { error } = await supabase.from("community_join_requests").insert({ community_id: community.id, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      setMyPendingRequests(prev => new Set(prev).add(community.id));
      toast.success("Join request sent!");
      return;
    }
    const { error } = await supabase.from("community_members").insert({ community_id: community.id, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    await supabase.from("communities").update({ member_count: (community.member_count || 0) + 1 }).eq("id", community.id);
    toast.success("Joined!"); fetchCommunities(); fetchMemberships();
  };

  const approveRequest = async (request: any) => {
    await supabase.from("community_join_requests").update({ status: "approved" }).eq("id", request.id);
    await supabase.from("community_members").insert({ community_id: request.community_id, user_id: request.user_id });
    const community = communities.find(c => c.id === request.community_id);
    if (community) await supabase.from("communities").update({ member_count: (community.member_count || 0) + 1 }).eq("id", request.community_id);
    toast.success("Request approved!");
    fetchJoinRequests(request.community_id); fetchCommunities();
  };

  const rejectRequest = async (request: any) => {
    await supabase.from("community_join_requests").update({ status: "rejected" }).eq("id", request.id);
    toast.success("Request rejected");
    fetchJoinRequests(request.community_id);
  };

  const leaveCommunity = async (id: string) => {
    if (!user) return;
    await supabase.from("community_members").delete().eq("community_id", id).eq("user_id", user.id);
    await supabase.from("communities").update({ member_count: Math.max((communities.find(c => c.id === id)?.member_count || 1) - 1, 0) }).eq("id", id);
    toast.success("Left community"); fetchCommunities(); fetchMemberships();
    if (selectedCommunity?.id === id) setSelectedCommunity(null);
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !user || !selectedCommunity) return;
    const { error } = await supabase.from("community_messages").insert({
      community_id: selectedCommunity.id, user_id: user.id, content: msgText, username: profile?.username || profile?.display_name || "User",
    });
    if (error) { toast.error(error.message); return; }
    setMsgText("");
  };

  const isCreator = (userId: string) => selectedCommunity?.created_by === userId;
  const isUserVerified = (uname: string) => VERIFIED_USERS.includes(uname?.toLowerCase());
  const filtered = communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Communities</h2>
          <p className="text-sm text-muted-foreground">{communities.length} communities</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100%-3.5rem)]">
        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-2 overflow-y-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Search..." />
          </div>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelectedCommunity(c)}
              className={`rounded-xl p-3 cursor-pointer transition-all ${selectedCommunity?.id === c.id ? "glass neon-border-active glow-box" : "glass border border-border/30 hover:border-primary/30"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    {c.join_mode === "request" ? <Lock className="w-3 h-3 text-muted-foreground shrink-0" /> : <Globe className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.member_count} members</p>
                </div>
                {myMemberships.has(c.id) ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">In</span>
                ) : myPendingRequests.has(c.id) ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Pending</span>
                ) : (
                  <button onClick={e => { e.stopPropagation(); joinCommunity(c); }}
                    className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground font-medium">
                    {c.join_mode === "request" ? "Request" : "Join"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {selectedCommunity ? (
            <div className="glass rounded-xl overflow-hidden flex flex-col h-full">
              <div className="p-3 border-b border-border/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCommunity.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display text-base font-bold text-foreground">{selectedCommunity.name}</h3>
                      {selectedCommunity.join_mode === "request" ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{selectedCommunity.member_count} members · {selectedCommunity.join_mode === "request" ? "Request to join" : "Open"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Admin: pending requests */}
                  {myMemberships.get(selectedCommunity.id) === "admin" && joinRequests.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-primary/15 text-primary flex items-center gap-1">
                      <Bell className="w-3 h-3" /> {joinRequests.length} requests
                    </span>
                  )}
                  {myMemberships.has(selectedCommunity.id) && (
                    <button onClick={() => leaveCommunity(selectedCommunity.id)}
                      className="text-xs px-3 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10">Leave</button>
                  )}
                </div>
              </div>

              {/* Admin join requests panel */}
              {myMemberships.get(selectedCommunity.id) === "admin" && joinRequests.length > 0 && (
                <div className="p-3 border-b border-border/30 bg-primary/5">
                  <p className="text-xs font-medium text-foreground mb-2">Pending Join Requests</p>
                  <div className="space-y-1">
                    {joinRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                        <span className="text-xs text-foreground">{r.user_id.slice(0, 8)}...</span>
                        <div className="flex gap-1">
                          <button onClick={() => approveRequest(r)} className="p-1 rounded bg-primary/15 text-primary hover:bg-primary/25"><Check className="w-3 h-3" /></button>
                          <button onClick={() => rejectRequest(r)} className="p-1 rounded bg-destructive/15 text-destructive hover:bg-destructive/25"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {!myMemberships.has(selectedCommunity.id) ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Join this community to see messages</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hi! 👋</p>
                ) : messages.map((m: any) => {
                  const isMine = m.user_id === user?.id;
                  const verified = isUserVerified(m.username);
                  const creator = isCreator(m.user_id);
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 ${isMine ? "bg-primary/20 text-foreground" : "bg-secondary/40 text-foreground"}`}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] font-medium text-primary">{m.username || "User"}</span>
                          {verified && <CheckCircle className="w-2.5 h-2.5 text-primary" />}
                          {creator && <Hammer className="w-2.5 h-2.5 text-primary" />}
                        </div>
                        <p className="text-sm">{m.content}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              {myMemberships.has(selectedCommunity.id) && (
                <div className="p-3 border-t border-border/30 shrink-0">
                  <div className="flex gap-2">
                    <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                      className="flex-1 bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Type a message..." />
                    <button onClick={sendMessage} className="p-2 rounded-lg bg-primary text-primary-foreground"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center flex-1 flex items-center justify-center flex-col">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Select a community to start chatting</p>
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
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
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newIcon === ic ? "bg-primary/20 neon-border-active" : "bg-secondary/40 border border-border/30"}`}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Join mode</p>
                  <div className="flex gap-2">
                    <button onClick={() => setNewJoinMode("open")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${newJoinMode === "open" ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
                      <Globe className="w-3.5 h-3.5" /> Open
                    </button>
                    <button onClick={() => setNewJoinMode("request")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${newJoinMode === "request" ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
                      <Lock className="w-3.5 h-3.5" /> Request to Join
                    </button>
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
