import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Search, Clock, Plus, X, Bookmark, BookmarkCheck, RefreshCw, ChevronUp, History, Eye, Maximize, Minimize, GripHorizontal, Expand, Shrink, Volume2, VolumeX, SkipForward, SkipBack, Gauge } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VIDEO_LIBRARY, SUBJECTS, getRecommendedVideos, extractYoutubeId, type Video } from "@/lib/videoLibrary";

const BATCH_SIZE = 16;

const VideoHub = () => {
  const { profile, isGuest, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareSubject, setShareSubject] = useState("Mathematics");
  const [sharedVideos, setSharedVideos] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"recommended" | "library" | "shared" | "history">("recommended");
  const [refreshKey, setRefreshKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("membrance_search_history") || "[]")
  );
  const [watchHistory, setWatchHistory] = useState<{ id: string; title: string; youtubeId: string; watchedAt: string }[]>(() =>
    JSON.parse(localStorage.getItem("membrance_watch_history") || "[]")
  );
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Draggable player state
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [draggingPlayer, setDraggingPlayer] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const userGrade = profile?.grade || "";

  // Build video pool — no timer, no auto-refresh
  const videoPool = useMemo(() => {
    const base = tab === "recommended" ? getRecommendedVideos(userGrade, VIDEO_LIBRARY.length) : [...VIDEO_LIBRARY];
    // Shuffle once per refreshKey
    return [...base].sort(() => Math.random() - 0.5);
  }, [userGrade, refreshKey, tab]);

  useEffect(() => { setVisibleCount(BATCH_SIZE); }, [searchQuery, selectedSubject, tab, refreshKey]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount(prev => prev + BATCH_SIZE); },
      { threshold: 0.1, rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { fetchSharedVideos(); if (user) fetchSaved(); }, [user]);

  // Realtime shared videos
  useEffect(() => {
    const channel = supabase
      .channel('shared_videos_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_videos' }, () => fetchSharedVideos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, 20);
    setSearchHistory(updated);
    localStorage.setItem("membrance_search_history", JSON.stringify(updated));
  };

  const addToWatchHistory = (video: Video) => {
    const entry = { id: video.id, title: video.title, youtubeId: video.youtubeId, watchedAt: new Date().toISOString() };
    const updated = [entry, ...watchHistory.filter(h => h.youtubeId !== video.youtubeId)].slice(0, 100);
    setWatchHistory(updated);
    localStorage.setItem("membrance_watch_history", JSON.stringify(updated));
  };

  const handlePlay = (video: Video) => {
    setPlayingVideo(video);
    setPlayingId(video.youtubeId);
    setIsMinimized(false);
    setIsFullscreen(false);
    setPlayerPos({ x: 0, y: 0 });
    addToWatchHistory(video);
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      setShowSearchSuggestions(false);
    }
  };

  const toggleSave = useCallback(async (video: Video) => {
    if (!user && !isGuest) { toast.error("Sign in to save videos"); return; }
    if (!user) {
      const saved = JSON.parse(localStorage.getItem("membrance_saved_videos") || "[]");
      const exists = saved.some((s: any) => s.youtubeId === video.youtubeId);
      if (exists) {
        localStorage.setItem("membrance_saved_videos", JSON.stringify(saved.filter((s: any) => s.youtubeId !== video.youtubeId)));
        setSavedIds(prev => { const n = new Set(prev); n.delete(video.youtubeId); return n; });
        toast.success("Removed from saved");
      } else {
        saved.unshift({ youtubeId: video.youtubeId, title: video.title, channel: video.channel });
        localStorage.setItem("membrance_saved_videos", JSON.stringify(saved));
        setSavedIds(prev => new Set(prev).add(video.youtubeId));
        toast.success("Video saved!");
      }
      return;
    }
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
    if (!user) { toast.error("Sign in to share videos"); return; }
    const { error } = await supabase.from("shared_videos").insert({
      user_id: user.id, title: shareTitle, youtube_url: shareUrl, subject: shareSubject, grade: userGrade || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Video shared!");
    setShowShareModal(false); setShareUrl(""); setShareTitle("");
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      playerContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen exit via Esc
  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const getFilteredVideos = useCallback(() => {
    let videos = videoPool;
    if (searchQuery) {
      const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      videos = videos.filter(v => {
        const text = `${v.title} ${v.channel} ${v.subject} ${v.grade} ${v.tags?.join(" ") || ""}`.toLowerCase();
        return terms.every(term => text.includes(term));
      });
    }
    if (selectedSubject !== "All") videos = videos.filter(v => v.subject === selectedSubject);
    return videos;
  }, [videoPool, searchQuery, selectedSubject]);

  const filtered = getFilteredVideos();
  const displayVideos = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const filteredShared = sharedVideos.filter((v: any) => {
    const ms = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const msu = selectedSubject === "All" || v.subject === selectedSubject;
    return ms && msu;
  });

  const scrollToTop = () => scrollTopRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!user) {
      const saved = JSON.parse(localStorage.getItem("membrance_saved_videos") || "[]");
      setSavedIds(new Set(saved.map((s: any) => s.youtubeId)));
    }
  }, [user]);

  // Player drag handlers
  const onPlayerPointerDown = (e: React.PointerEvent) => {
    if (isFullscreen) return;
    setDraggingPlayer(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: playerPos.x, py: playerPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPlayerPointerMove = (e: React.PointerEvent) => {
    if (!draggingPlayer) return;
    setPlayerPos({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };
  const onPlayerPointerUp = () => setDraggingPlayer(false);

  const filteredSuggestions = searchHistory.filter(h => h.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const VideoCard = useCallback(({ video, index }: { video: Video; index: number }) => (
    <div className="rounded-xl overflow-hidden bg-card/60 border border-border/30 group cursor-pointer hover:border-primary/40 transition-all">
      <div className="relative aspect-video bg-secondary/40" onClick={() => handlePlay(video)}>
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/default.jpg`; }}
        />
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
    </div>
  ), [savedIds, toggleSave]);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto min-h-screen">
      <div ref={scrollTopRef} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Video Hub</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} videos · {userGrade || "All grades"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 rounded-lg bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30 transition-colors" title="Shuffle feed">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(["recommended", "library", "shared", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === t ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
            {t === "recommended" ? "⭐ For You" : t === "library" ? "📚 All" : t === "shared" ? `🌐 Community (${sharedVideos.length})` : "🕐 History"}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchSuggestions(true); }}
            onKeyDown={handleSearch}
            onFocus={() => setShowSearchSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
            className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search videos, channels, topics..." />
          {showSearchSuggestions && filteredSuggestions.length > 0 && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg border border-border/30 z-20 overflow-hidden">
              {filteredSuggestions.map((s, i) => (
                <button key={i} onClick={() => { setSearchQuery(s); setShowSearchSuggestions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/40 transition-colors text-left">
                  <History className="w-3 h-3 text-muted-foreground" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${selectedSubject === s ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "history" ? (
        <div className="space-y-3">
          {watchHistory.length === 0 ? (
            <div className="rounded-xl bg-card/60 border border-border/30 p-10 text-center">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No watch history yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {watchHistory.map((h, i) => {
                const video = VIDEO_LIBRARY.find(v => v.youtubeId === h.youtubeId);
                if (!video) return null;
                return <VideoCard key={`${h.youtubeId}-${i}`} video={video} index={i} />;
              })}
            </div>
          )}
          {searchHistory.length > 0 && (
            <div className="rounded-xl bg-card/60 border border-border/30 p-4 mt-4">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Recent Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((s, i) => (
                  <button key={i} onClick={() => { setSearchQuery(s); setTab("library"); }}
                    className="px-3 py-1.5 rounded-full bg-secondary/40 text-xs text-muted-foreground hover:text-foreground border border-border/30 transition-colors">
                    {s}
                  </button>
                ))}
                <button onClick={() => { setSearchHistory([]); localStorage.removeItem("membrance_search_history"); toast.success("Cleared"); }}
                  className="px-3 py-1.5 rounded-full bg-destructive/10 text-xs text-destructive border border-destructive/20">
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      ) : tab !== "shared" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayVideos.map((video, i) => <VideoCard key={video.id} video={video} index={i} />)}
            {displayVideos.length === 0 && (
              <div className="col-span-full rounded-xl bg-card/60 border border-border/30 p-10 text-center">
                <p className="text-muted-foreground text-sm">No videos match your search.</p>
              </div>
            )}
          </div>
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading more...
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShared.map((video: any) => {
            const ytId = extractYoutubeId(video.youtube_url);
            if (!ytId) return null;
            return (
              <div key={video.id}
                onClick={() => handlePlay({ id: video.id, title: video.title, subject: video.subject || "General", grade: video.grade || "", duration: "", youtubeId: ytId, channel: "Community", points: 0 })}
                className="rounded-xl overflow-hidden bg-card/60 border border-border/30 group cursor-pointer hover:border-primary/40 transition-all">
                <div className="relative aspect-video bg-secondary/40">
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/default.jpg`; }} />
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
              </div>
            );
          })}
          {filteredShared.length === 0 && (
            <div className="col-span-full rounded-xl bg-card/60 border border-border/30 p-10 text-center">
              <p className="text-muted-foreground text-sm">No shared videos yet. Be the first!</p>
            </div>
          )}
        </div>
      )}

      {/* Scroll to top */}
      {visibleCount > BATCH_SIZE * 2 && (
        <button onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Video Player Popup — draggable, with custom fullscreen */}
      <AnimatePresence>
        {playingId && playingVideo && (
          <motion.div
            ref={playerContainerRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-50 overflow-hidden shadow-2xl ${
              isFullscreen
                ? "inset-0 rounded-none"
                : isMinimized
                  ? "bottom-4 right-4 w-[300px] rounded-xl border border-primary/30"
                  : "bottom-4 right-4 w-[90vw] max-w-[680px] rounded-xl border border-primary/30"
            }`}
            style={!isFullscreen ? { transform: `translate(${playerPos.x}px, ${playerPos.y}px)` } : undefined}
          >
            {/* Custom top bar / drag handle */}
            <div
              className={`flex items-center justify-between px-3 py-2 bg-card border-b border-border/30 ${isFullscreen ? "" : "cursor-grab active:cursor-grabbing"}`}
              onPointerDown={onPlayerPointerDown}
              onPointerMove={onPlayerPointerMove}
              onPointerUp={onPlayerPointerUp}
              style={{ touchAction: "none" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {!isFullscreen && <GripHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />}
                <span className="text-xs text-foreground font-medium truncate">{playingVideo.title}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                  {isMinimized ? <Maximize className="w-3.5 h-3.5" /> : <Minimize className="w-3.5 h-3.5" />}
                </button>
                <button onClick={toggleFullscreen}
                  className="p-1.5 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                  {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setPlayingId(null); setPlayingVideo(null); if (isFullscreen) { document.exitFullscreen?.().catch(() => {}); setIsFullscreen(false); } }}
                  className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Video */}
            {!isMinimized && (
              <div className={`relative w-full ${isFullscreen ? "h-[calc(100vh-80px)]" : "aspect-video"}`}>
                <iframe
                  src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            )}

            {/* Custom bottom bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-card border-t border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{playingVideo.channel}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{playingVideo.subject}</span>
              </div>
              <button onClick={() => toggleSave(playingVideo)}
                className="p-1 rounded hover:bg-secondary/60 transition-colors">
                {savedIds.has(playingVideo.youtubeId) ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowShareModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-xl p-6 w-full max-w-md border border-border/30 shadow-xl" onClick={e => e.stopPropagation()}>
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
