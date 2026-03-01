import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Search, Filter, Clock, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Video {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  thumbnail: string;
}

const SAMPLE_VIDEOS: Video[] = [
  { id: "1", title: "Introduction to Algebra", subject: "Mathematics", grade: "Grade 7", duration: "12:30", thumbnail: "" },
  { id: "2", title: "The Solar System", subject: "Science", grade: "Grade 5", duration: "15:45", thumbnail: "" },
  { id: "3", title: "Photosynthesis Explained", subject: "Biology", grade: "Grade 8", duration: "10:20", thumbnail: "" },
  { id: "4", title: "English Grammar Basics", subject: "English", grade: "Grade 6", duration: "8:15", thumbnail: "" },
  { id: "5", title: "World War II Overview", subject: "History", grade: "Grade 9", duration: "20:00", thumbnail: "" },
  { id: "6", title: "Chemical Reactions", subject: "Chemistry", grade: "Grade 10", duration: "14:50", thumbnail: "" },
  { id: "7", title: "Trigonometry Fundamentals", subject: "Mathematics", grade: "Grade 10", duration: "18:30", thumbnail: "" },
  { id: "8", title: "Cell Biology", subject: "Biology", grade: "Grade 9", duration: "11:40", thumbnail: "" },
  { id: "9", title: "Creative Writing Tips", subject: "English", grade: "Grade 7", duration: "9:25", thumbnail: "" },
];

const SUBJECTS = ["All", "Mathematics", "Science", "Biology", "Chemistry", "English", "History"];

const VideoHub = () => {
  const { profile, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const userGrade = profile?.grade || (isGuest ? localStorage.getItem("membrance_profile") ? JSON.parse(localStorage.getItem("membrance_profile")!).grade : "" : "");

  const filteredVideos = SAMPLE_VIDEOS.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || v.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Video Hub</h2>
          <p className="text-sm text-muted-foreground">Study videos curated for {userGrade || "your grade"}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/60 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search videos..." />
        </div>
        <div className="flex gap-1">
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedSubject === s ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video, i) => (
          <motion.div key={video.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-active transition-all">
            {/* Thumbnail placeholder */}
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
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.subject}</span>
                <span className="text-xs text-muted-foreground">{video.grade}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No videos match your search. Try a different filter.</p>
        </div>
      )}
    </div>
  );
};

export default VideoHub;
