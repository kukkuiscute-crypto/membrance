import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Search, Filter, Clock, Award, Radio, Star, Plus, Link, X, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  youtubeId: string;
  channel: string;
  points: number;
}

const REAL_VIDEOS: Video[] = [
  { id: "1", title: "Introduction to Algebra", subject: "Mathematics", grade: "Grade 7", duration: "12:01", youtubeId: "NybHckSEQBI", channel: "Khan Academy", points: 5 },
  { id: "2", title: "The Solar System 101", subject: "Science", grade: "Grade 5", duration: "3:42", youtubeId: "libKVRa01L8", channel: "National Geographic", points: 5 },
  { id: "3", title: "Photosynthesis", subject: "Biology", grade: "Grade 8", duration: "12:28", youtubeId: "uixA8ZXx0KU", channel: "Amoeba Sisters", points: 5 },
  { id: "4", title: "Parts of Speech", subject: "English", grade: "Grade 6", duration: "9:08", youtubeId: "SceDmiBEAGE", channel: "English with Lucy", points: 5 },
  { id: "5", title: "World War II in 7 Minutes", subject: "History", grade: "Grade 9", duration: "7:09", youtubeId: "HUqy-OQvVtI", channel: "History Channel", points: 5 },
  { id: "6", title: "Chemical Reactions and Equations", subject: "Chemistry", grade: "Grade 10", duration: "14:21", youtubeId: "eNsVaUCzvLA", channel: "Khan Academy", points: 5 },
  { id: "7", title: "Trigonometry Basics", subject: "Mathematics", grade: "Grade 10", duration: "16:05", youtubeId: "PUB0TaZ7bhA", channel: "The Organic Chemistry Tutor", points: 5 },
  { id: "8", title: "Cell Structure and Function", subject: "Biology", grade: "Grade 9", duration: "10:22", youtubeId: "URUJD5NEXC8", channel: "Amoeba Sisters", points: 5 },
  { id: "9", title: "Creative Writing Tips", subject: "English", grade: "Grade 7", duration: "4:55", youtubeId: "yPJqFNm0MaA", channel: "TED-Ed", points: 5 },
  { id: "10", title: "Newton's Laws of Motion", subject: "Physics", grade: "Grade 9", duration: "10:12", youtubeId: "kKKM8Y-u7ds", channel: "CrashCourse", points: 5 },
  { id: "11", title: "Fractions for Beginners", subject: "Mathematics", grade: "Grade 4", duration: "9:30", youtubeId: "n0FZhQ_GkKw", channel: "Math Antics", points: 5 },
  { id: "12", title: "The Water Cycle", subject: "Science", grade: "Grade 3", duration: "3:22", youtubeId: "al-do-HGuIk", channel: "NASA", points: 5 },
  { id: "13", title: "Gravity Explained Simply", subject: "Physics", grade: "Grade 8", duration: "8:10", youtubeId: "Jnoxz2dBhgk", channel: "Kurzgesagt", points: 5 },
  { id: "14", title: "Periodic Table Explained", subject: "Chemistry", grade: "Grade 9", duration: "12:07", youtubeId: "0RRVV4Diomg", channel: "TED-Ed", points: 5 },
  { id: "15", title: "Pythagorean Theorem", subject: "Mathematics", grade: "Grade 8", duration: "10:06", youtubeId: "AA6RfgP-AHU", channel: "Khan Academy", points: 5 },
];

const SUBJECTS = ["All", "Mathematics", "Science", "Biology", "Chemistry", "Physics", "English", "History"];

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
  const [tab, setTab] = useState<"library" | "shared">("library");
  const [schoolLive, setSchoolLive] = useState(false);

  const userGrade = profile?.grade || (isGuest ? (() => { try { return JSON.parse(localStorage.getItem("membrance_profile") || "{}").grade; } catch { return ""; } })() : "");

  useEffect(() => {
    fetchSharedVideos();
  }, []);

  const fetchSharedVideos = async () => {
    const { data } = await supabase.from("shared_videos").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setSharedVideos(data);
  };

  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleShareVideo = async () => {
    if (!shareUrl || !shareTitle) { toast.error("Fill in title and URL"); return; }
    const ytId = extractYoutubeId(shareUrl);
    if (!ytId) { toast.error("Invalid YouTube URL"); return; }
    if (!user || isGuest) { toast.error("Sign in to share videos"); return; }

    const { error } = await supabase.from("shared_videos").insert({
      user_id: user.id,
      title: shareTitle,
      youtube_url: shareUrl,
      subject: shareSubject,
      grade: userGrade || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Video shared!");
    setShowShareModal(false);
    setShareUrl("");
    setShareTitle("");
    fetchSharedVideos();
  };

  const filteredVideos = REAL_VIDEOS.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || v.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const filteredShared = sharedVideos.filter((v: any) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || v.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Video Hub</h2>
          <p className="text-sm text-muted-foreground">Real study videos for {userGrade || "your grade"}</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.school_name && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${schoolLive ? "bg-destructive/15 text-destructive" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
              <Radio className={`w-3.5 h-3.5 ${schoolLive ? "animate-pulse" : ""}`} />
              {schoolLive ? "School Live" : "No School Stream"}
            </div>
          )}
          <button onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Share Video
          </button>
        </div>
      </div>

      {/* Player */}
      <AnimatePresence>
        {playingId && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl overflow-hidden mb-6 neon-border-active">
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between p-3">
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
        {(["library", "shared"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
            {t === "library" ? "📚 Library" : `🌐 Community (${sharedVideos.length})`}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search videos..." />
        </div>
        <div className="flex gap-1 flex-wrap">
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedSubject === s ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {tab === "library" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setPlayingId(video.youtubeId)}
              className="glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-active transition-all">
              <div className="relative aspect-video bg-secondary/40">
                <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title}
                  className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-background/80 px-1.5 py-0.5 rounded text-xs text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {video.duration}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.subject}</span>
                  <span className="text-xs text-muted-foreground">{video.grade}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShared.map((video: any, i: number) => {
            const ytId = extractYoutubeId(video.youtube_url);
            if (!ytId) return null;
            return (
              <motion.div key={video.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setPlayingId(ytId)}
                className="glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-active transition-all">
                <div className="relative aspect-video bg-secondary/40">
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={video.title}
                    className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {video.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.subject}</span>}
                    <span className="text-xs text-muted-foreground">Shared by user</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filteredShared.length === 0 && (
            <div className="col-span-full glass rounded-xl p-12 text-center">
              <Link className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No shared videos yet. Be the first to share!</p>
            </div>
          )}
        </div>
      )}

      {tab === "library" && filteredVideos.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No videos match your search.</p>
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowShareModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
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
