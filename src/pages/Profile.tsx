import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Trophy, Star, UserPlus, UserMinus, MessageSquare, Search, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getRankInfo } from "@/lib/ranks";

const Profile = () => {
  const { user, isGuest, profile, refreshProfile } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tab, setTab] = useState<"profile" | "connections">("profile");

  useEffect(() => { if (user) { fetchConnections(); fetchPending(); } }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    const { data } = await supabase.from("study_connections").select("*").or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`).eq("status", "accepted");
    if (data) {
      const ids = data.map(c => c.user_id === user.id ? c.connected_user_id : c.user_id);
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
        setConnections(profiles || []);
      }
    }
  };

  const fetchPending = async () => {
    if (!user) return;
    const { data } = await supabase.from("study_connections").select("*").eq("connected_user_id", user.id).eq("status", "pending");
    if (data && data.length > 0) {
      const ids = data.map(c => c.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
      setPendingRequests(profiles || []);
    }
  };

  const searchUsers = async () => {
    if (!searchUser.trim()) return;
    const { data } = await supabase.from("profiles").select("*")
      .or(`username.ilike.%${searchUser}%,display_name.ilike.%${searchUser}%`)
      .neq("user_id", user?.id || "")
      .limit(10);
    setSearchResults(data || []);
  };

  const sendRequest = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await supabase.from("study_connections").insert({ user_id: user.id, connected_user_id: targetUserId, status: "pending" });
    if (error) { toast.error(error.message); return; }
    toast.success("Connection request sent!");
  };

  const acceptRequest = async (fromUserId: string) => {
    if (!user) return;
    await supabase.from("study_connections").update({ status: "accepted" }).eq("user_id", fromUserId).eq("connected_user_id", user.id);
    toast.success("Connection accepted!");
    fetchConnections(); fetchPending();
  };

  const isVerified = profile?.is_verified || profile?.username?.toLowerCase() === "kukkuiscute";
  const rankInfo = getRankInfo(profile?.points || 0);

  if (isGuest || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-xl p-12 text-center max-w-md">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">Profile</h3>
          <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("profile")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === "profile" ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
          👤 Profile
        </button>
        <button onClick={() => setTab("connections")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === "connections" ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
          🤝 Study Connections ({connections.length})
        </button>
      </div>

      {tab === "profile" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Profile Card */}
          <div className="glass rounded-xl p-6 glow-box">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-foreground">{profile?.display_name || profile?.username || "Student"}</h2>
                  {isVerified && (
                    <span className="flex items-center gap-0.5 text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                <p className="text-xs text-muted-foreground mt-1">{profile?.grade || "—"} · {profile?.school_name || "No school"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-secondary/30 rounded-lg p-3 text-center border border-border/20">
                <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{profile?.points || 0}</p>
                <p className="text-[10px] text-muted-foreground">All-time Points</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center border border-border/20">
                <Star className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{profile?.monthly_points || 0}</p>
                <p className="text-[10px] text-muted-foreground">Monthly Points</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center border border-border/20">
                <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{rankInfo.rank}</p>
                <p className="text-[10px] text-muted-foreground">Rank</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Pending Requests</h3>
              {pendingRequests.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.display_name || p.username}</p>
                  </div>
                  <button onClick={() => acceptRequest(p.user_id)}
                    className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium">Accept</button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Find Students</h3>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={searchUser} onChange={e => setSearchUser(e.target.value)} onKeyDown={e => e.key === "Enter" && searchUsers()}
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Search by username..." />
              </div>
              <button onClick={searchUsers} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Search</button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 border border-border/20">
                    <div className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                        {r.display_name || r.username || "Student"}
                        {(r.is_verified || r.username?.toLowerCase() === "kukkuiscute") && <span className="text-primary text-xs">✓</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.grade || "—"} · {r.points || 0} pts</p>
                    </div>
                    <button onClick={() => sendRequest(r.user_id)}
                      className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-primary/15 text-primary font-medium hover:bg-primary/25">
                      <UserPlus className="w-3 h-3" /> Connect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connections List */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Your Connections ({connections.length})</h3>
            {connections.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No connections yet. Search for students above!</p>
            ) : (
              <div className="space-y-2">
                {connections.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 border border-border/20">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.display_name || c.username}</p>
                      <p className="text-xs text-muted-foreground">{c.grade || "—"} · {c.points || 0} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
