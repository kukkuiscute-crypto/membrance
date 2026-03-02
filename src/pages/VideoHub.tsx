import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Search, Filter, Clock, BookOpen, Award, Radio, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  durationSec: number;
  thumbnail: string;
  channel: string;
  points: number;
}

const SAMPLE_VIDEOS: Video[] = [
  { id: "1", title: "Introduction to Algebra", subject: "Mathematics", grade: "Grade 7", duration: "12:30", durationSec: 750, thumbnail: "", channel: "Khan Academy", points: 5 },
  { id: "2", title: "The Solar System", subject: "Science", grade: "Grade 5", duration: "15:45", durationSec: 945, thumbnail: "", channel: "National Geographic", points: 5 },
  { id: "3", title: "Photosynthesis Explained", subject: "Biology", grade: "Grade 8", duration: "10:20", durationSec: 620, thumbnail: "", channel: "Khan Academy", points: 5 },
  { id: "4", title: "English Grammar Basics", subject: "English", grade: "Grade 6", duration: "8:15", durationSec: 495, thumbnail: "", channel: "BBC Learning", points: 5 },
  { id: "5", title: "World War II Overview", subject: "History", grade: "Grade 9", duration: "20:00", durationSec: 1200, thumbnail: "", channel: "CrashCourse", points: 5 },
  { id: "6", title: "Chemical Reactions", subject: "Chemistry", grade: "Grade 10", duration: "14:50", durationSec: 890, thumbnail: "", channel: "Khan Academy", points: 5 },
  { id: "7", title: "Trigonometry Fundamentals", subject: "Mathematics", grade: "Grade 10", duration: "18:30", durationSec: 1110, thumbnail: "", channel: "Professor Leonard", points: 5 },
  { id: "8", title: "Cell Biology", subject: "Biology", grade: "Grade 9", duration: "11:40", durationSec: 700, thumbnail: "", channel: "Amoeba Sisters", points: 5 },
  { id: "9", title: "Creative Writing Tips", subject: "English", grade: "Grade 7", duration: "9:25", durationSec: 565, thumbnail: "", channel: "TED-Ed", points: 5 },
  { id: "10", title: "Newton's Laws of Motion", subject: "Physics", grade: "Grade 9", duration: "16:10", durationSec: 970, thumbnail: "", channel: "Veritasium", points: 5 },
  { id: "11", title: "Fractions Made Easy", subject: "Mathematics", grade: "Grade 4", duration: "7:30", durationSec: 450, thumbnail: "", channel: "Khan Academy", points: 5 },
  { id: "12", title: "The Water Cycle", subject: "Science", grade: "Grade 3", duration: "6:00", durationSec: 360, thumbnail: "", channel: "National Geographic Kids", points: 5 },
];

const SUBJECTS = ["All", "Mathematics", "Science", "Biology", "Chemistry", "Physics", "English", "History"];

const VideoHub = () => {
  const { profile, isGuest, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("membrance_watched");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const watchInterval = useRef<number | null>(null);
  const [schoolLive, setSchoolLive] = useState(false);

  const userGrade = profile?.grade || (isGuest ? (() => { try { return JSON.parse(localStorage.getItem("membrance_profile") || "{}").grade; } catch { return ""; } })() : "");

  useEffect(() => {
    localStorage.setItem("membrance_watched", JSON.stringify([...watchedVideos]));
  }, [watchedVideos]);

  const filteredVideos = SAMPLE_VIDEOS.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || v.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const startWatching = (videoId: string) => {
    setPlayingId(videoId);
    setWatchTime(0);
    if (watchInterval.current) clearInterval(watchInterval.current);
    watchInterval.current = window.setInterval(() => {
      setWatchTime(prev => prev + 1);
    }, 1000);
  };

  const stopWatching = async () => {
    if (watchInterval.current) clearInterval(watchInterval.current);
    if (playingId && watchTime >= 270 && !watchedVideos.has(playingId)) {
      // 4:30 = 270 seconds
      setWatchedVideos(prev => new Set([...prev, playingId]));
      if (user && !isGuest) {
        const { data } = await supabase.from("profiles").select("points").eq("user_id", user.id).single();
        if (data) {
          await supabase.from("profiles").update({ points: (data.points || 0) + 5 }).eq("user_id", user.id);
        }
        toast.success("+5 PTS for watching!");
      }
    } else if (playingId && watchTime < 270) {
      toast.info(`Watch at least 4:30 to earn points (${Math.floor(watchTime / 60)}:${(watchTime % 60).toString().padStart(2, "0")} watched)`);
    }
    setPlayingId(null);
    setWatchTime(0);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Video Hub</h2>
          <p className="text-sm text-muted-foreground">Accredited study videos for {userGrade || "your grade"}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* School Live indicator */}
          {profile?.school_name && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${schoolLive ? "bg-destructive/15 text-destructive neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"}`}>
              <Radio className={`w-3.5 h-3.5 ${schoolLive ? "animate-pulse" : ""}`} />
              {schoolLive ? "School Live" : "No School Stream"}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
            <Award className="w-3.5 h-3.5" />
            +5 PTS per video (4:30+ watch)
          </div>
        </div>
      </div>

      {/* Video player overlay */}
      {playingId && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 mb-6 neon-border-active glow-box">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-display font-bold text-foreground">{SAMPLE_VIDEOS.find(v => v.id === playingId)?.title}</p>
              <p className="text-xs text-muted-foreground">{SAMPLE_VIDEOS.find(v => v.id === playingId)?.channel}</p>
            </div>
            <button onClick={stopWatching} className="px-4 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/30">Stop</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-secondary/60 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${Math.min((watchTime / (SAMPLE_VIDEOS.find(v => v.id === playingId)?.durationSec || 600)) * 100, 100)}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-mono">{Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, "0")}</span>
            {watchTime >= 270 && <Star className="w-4 h-4 text-primary animate-pulse" />}
          </div>
        </motion.div>
      )}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video, i) => {
          const watched = watchedVideos.has(video.id);
          return (
            <motion.div key={video.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !playingId && startWatching(video.id)}
              className={`glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-active transition-all ${watched ? "opacity-70" : ""}`}>
              <div className="relative aspect-video bg-secondary/40 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center glow-box-strong">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-background/80 px-1.5 py-0.5 rounded text-xs text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {video.duration}
                </div>
                {watched && (
                  <div className="absolute top-2 left-2 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" /> Watched
                  </div>
                )}
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
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No videos match your search.</p>
        </div>
      )}
    </div>
  );
};

export default VideoHub;
