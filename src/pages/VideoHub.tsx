import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Search, Clock, Plus, X, Bookmark, BookmarkCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VIDEO_LIBRARY, SUBJECTS, getRecommendedVideos, extractYoutubeId, type Video } from "@/lib/videoLibrary";

const VideoHub = () => {
  const { profile, isGuest, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareSubject, setShareSubject] = useState("Mathematics");
  const [sharedVideos, setSharedVideos] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"recommended" | "library" | "shared">("recommended");
  const [refreshKey, setRefreshKey] = useState(0);

  const userGrade = profile?.grade || "";

  const recommended = useMemo(() => getRecommendedVideos(userGrade, 15), [userGrade, refreshKey]);

  useEffect(() => { fetchSharedVideos(); if (user) fetchSaved(); }, [user]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSharedVideos = async () => {
    const { data } = await supabase.from("shared_videos").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setSharedVideos(data);
  };

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from("saved_videos").select("youtube_id").eq("user_id", user.id);
    if (data) setSavedIds(new Set(data.map((d: any) => d.youtube_id).filter(Boolean)));
  };

  const toggleSave = useCallback(async (video: Video) => {
    if (!user || isGuest) { toast.error("Sign in to save videos"); return; }
    if (savedIds.has(video.youtubeId)) {
      await supabase.from("saved_videos").delete().eq("user_id", user.id).eq("youtube_id", video.youtubeId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(video.youtubeId); return n; });
      toast.success("Removed from saved");
    } else {
      await supabase.from("saved_videos").insert({
        user_id: user.id, title: video.title, youtube_url: `https://youtube.com/watch?v=${video.youtubeId}`,
        youtube_id: video.youtubeId, channel: video.channel, thumbnail_url: `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`,
      });
      setSavedIds(prev => new Set(prev).add(video.youtubeId));
      toast.success("Video saved!");
    }
  }, [user, isGuest, savedIds]);

  const handleShareVideo = async () => {
    if (!shareUrl || !shareTitle) { toast.error("Fill in title and URL"); return; }
    const ytId = extractYoutubeId(shareUrl);
    if (!ytId) { toast.error("Invalid YouTube URL"); return; }
    if (!user || isGuest) { toast.error("Sign in to share videos"); return; }
    const { error } = await supabase.from("shared_videos").insert({
      user_id: user.id, title: shareTitle, youtube_url: shareUrl, subject: shareSubject, grade: userGrade || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Video shared!");
    setShowShareModal(false); setShareUrl(""); setShareTitle("");
    fetchSharedVideos();
  };

  const getVideos = () => {
    let videos: Video[] = tab === "recommended" ? recommended : VIDEO_LIBRARY;
    if (searchQuery) videos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase()) || v.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    if (selectedSubject !== "All") videos = videos.filter(v => v.subject === selectedSubject);
    return videos;
  };

  const filteredShared = sharedVideos.filter((v: any) => {
    const ms = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const msu = selectedSubject === "All" || v.subject === selectedSubject;
    return ms && msu;
  });

  const VideoCard = ({ video, index }: { video: Video; index: number }) => (
    <motion.div key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-active transition-all">
      <div className="relative aspect-video bg-secondary/40" onClick={() => setPlayingId(video.youtubeId)}>
        <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title}
          className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-background/80 px-1.5 py-0.5 rounded text-xs text-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> {video.duration}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{video.channel}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleSave(video); }}
            className="shrink-0 p-1 rounded hover:bg-secondary/60 transition-colors">
            {savedIds.has(video.youtubeId) ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.subject}</span>
          <span className="text-xs text-muted-foreground">{video.grade}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Video Hub</h2>
          <p className="text-sm text-muted-foreground">{VIDEO_LIBRARY.length}+ educational videos · {userGrade || "All grades"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 rounded-lg bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Player */}
      <AnimatePresence>
        {playingId && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="glass rounded-xl overflow-hidden mb-5 neon-border-active">
            <div className="relative aspect-video w-full">
              <iframe src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <div className="flex items-center justify-between p-2.5">
              <span className="text-xs text-muted-foreground">Playing now</span>
              <button onClick={() => setPlayingId(null)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-destructive/20 text-destructive text-xs font-medium hover:bg-destructive/30">
                <X className="w-3 h-3" /> Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["recommended", "library", "shared"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
            {t === "recommended" ? `⭐ For You` : t === "library" ? `📚 All (${VIDEO_LIBRARY.length})` : `🌐 Community (${sharedVideos.length})`}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search videos, channels, topics..." />
        </div>
        <div className="flex gap-1 flex-wrap">
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedSubject === s ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {tab !== "shared" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getVideos().map((video, i) => <VideoCard key={video.id} video={video} index={i} />)}
          {getVideos().length === 0 && (
            <div className="col-span-full glass rounded-xl p-10 text-center">
              <p className="text-muted-foreground text-sm">No videos match your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShared.map((video: any, i: number) => {
            const ytId = extractYoutubeId(video.youtube_url);
            if (!ytId) return null;
            return (
              <motion.div key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }} onClick={() => setPlayingId(ytId)}
                className="glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-active transition-all">
                <div className="relative aspect-video bg-secondary/40">
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-primary/90 flex items-center justify-center"><Play className="w-5 h-5 text-primary-foreground ml-0.5" /></div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {video.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.subject}</span>}
                    <span className="text-xs text-muted-foreground">Community</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredShared.length === 0 && (
            <div className="col-span-full glass rounded-xl p-10 text-center">
              <p className="text-muted-foreground text-sm">No shared videos yet. Be the first!</p>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowShareModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-md glow-box" onClick={e => e.stopPropagation()}>
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Share a Video</h3>
              <div className="space-y-3">
                <input value={shareTitle} onChange={e => setShareTitle(e.target.value)} placeholder="Video title"
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input value={shareUrl} onChange={e => setShareUrl(e.target.value)} placeholder="YouTube URL"
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <select value={shareSubject} onChange={e => setShareSubject(e.target.value)}
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {SUBJECTS.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowShareModal(false)} className="flex-1 py-2.5 rounded-lg border border-border/50 text-muted-foreground text-sm">Cancel</button>
                  <button onClick={handleShareVideo} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Share</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoHub;
