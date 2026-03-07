import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Clock, Layers, Trophy, PlayCircle, StickyNote, Target, CheckCircle, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALL_SUBJECTS = ["Math", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology", "Computer Science", "Economics"];

const QUIZ_BANK: Record<string, { q: string; options: string[]; answer: number }[]> = {
  Math: [
    { q: "What is 15 × 12?", options: ["170", "180", "190", "160"], answer: 1 },
    { q: "√144 = ?", options: ["11", "12", "13", "14"], answer: 1 },
    { q: "What is 7³?", options: ["343", "349", "243", "353"], answer: 0 },
    { q: "Solve: 2x + 5 = 17", options: ["x = 5", "x = 6", "x = 7", "x = 4"], answer: 1 },
  ],
  Science: [
    { q: "What gas do plants absorb?", options: ["O₂", "CO₂", "N₂", "H₂"], answer: 1 },
    { q: "What is the speed of light?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10⁵ m/s", "3×10⁷ m/s"], answer: 1 },
    { q: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], answer: 2 },
    { q: "Water boils at what temperature (°C)?", options: ["90", "100", "110", "80"], answer: 1 },
  ],
  English: [
    { q: "What is a synonym for 'happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], answer: 1 },
    { q: "Which is a noun?", options: ["Run", "Beautiful", "Table", "Quickly"], answer: 2 },
    { q: "'She sings well' — 'well' is a(n):", options: ["Noun", "Adjective", "Adverb", "Verb"], answer: 2 },
  ],
  History: [
    { q: "Who discovered America?", options: ["Magellan", "Columbus", "Vasco da Gama", "Cook"], answer: 1 },
    { q: "When did WW2 end?", options: ["1944", "1945", "1946", "1943"], answer: 1 },
    { q: "The French Revolution began in:", options: ["1776", "1789", "1804", "1799"], answer: 1 },
  ],
  Geography: [
    { q: "What is the largest continent?", options: ["Africa", "Europe", "Asia", "N. America"], answer: 2 },
    { q: "Which river is the longest?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
  ],
  Physics: [
    { q: "F = m × ?", options: ["v", "a", "d", "t"], answer: 1 },
    { q: "Unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], answer: 2 },
    { q: "What does 'g' represent?", options: ["Gravity", "Gas", "Gauge", "Grid"], answer: 0 },
  ],
  Chemistry: [
    { q: "Chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
    { q: "pH of pure water?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "How many elements in the periodic table?", options: ["108", "118", "128", "98"], answer: 1 },
  ],
  Biology: [
    { q: "Powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], answer: 2 },
    { q: "DNA stands for?", options: ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dinitro Acid", "None"], answer: 1 },
  ],
  "Computer Science": [
    { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Processing Unit"], answer: 1 },
    { q: "Binary for 10?", options: ["1010", "1100", "1001", "0110"], answer: 0 },
  ],
  Economics: [
    { q: "GDP stands for?", options: ["Gross Domestic Product", "General Domestic Price", "Gross Direct Product", "General Data Product"], answer: 0 },
    { q: "Law of demand: price ↑, demand ?", options: ["↑", "↓", "Stays same", "Doubles"], answer: 1 },
  ],
};

interface WorkstationProps {
  onFinishLesson: () => void;
}

const Workstation = ({ onFinishLesson }: WorkstationProps) => {
  const navigate = useNavigate();
  const { profile, isGuest, user } = useAuth();
  const grade = profile?.grade || (isGuest ? localStorage.getItem("membrance_profile") ? JSON.parse(localStorage.getItem("membrance_profile")!).grade : "Student" : "Student");
  const name = profile?.display_name || profile?.username || "Student";

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("membrance_quiz_subjects");
    return saved ? JSON.parse(saved) : ["Math", "Science"];
  });
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<{ q: string; options: string[]; answer: number; subject: string }[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const watchHistory = JSON.parse(localStorage.getItem("membrance_watch_history") || "[]");
  const videosWatched = watchHistory.length;

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => {
      const next = prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s];
      localStorage.setItem("membrance_quiz_subjects", JSON.stringify(next));
      return next;
    });
  };

  const startQuiz = () => {
    if (selectedSubjects.length === 0) { toast.error("Select at least one subject"); return; }
    const pool: typeof quizQuestions = [];
    selectedSubjects.forEach(sub => {
      const questions = QUIZ_BANK[sub] || [];
      questions.forEach(q => pool.push({ ...q, subject: sub }));
    });
    // Shuffle and pick 5
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5);
    if (shuffled.length === 0) { toast.error("No questions available"); return; }
    setQuizQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setAnswered(null);
    setQuizDone(false);
    setQuizActive(true);
  };

  const handleAnswer = async (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === quizQuestions[currentQ].answer;
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQ + 1 >= quizQuestions.length) {
        setQuizDone(true);
        // Award points based on score
        const pts = (correct ? score + 1 : score) * 5;
        if (pts > 0 && user && !isGuest) {
          addQuizPoints(pts);
        }
      } else {
        setCurrentQ(c => c + 1);
        setAnswered(null);
      }
    }, 1200);
  };

  const addQuizPoints = async (amount: number) => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("points, monthly_points").eq("user_id", user.id).single();
    if (data) {
      await supabase.from("profiles").update({
        points: (data.points || 0) + amount,
        monthly_points: (data.monthly_points || 0) + amount,
      }).eq("user_id", user.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {quizActive ? (
          <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-8 max-w-2xl w-full glow-box relative overflow-hidden">
            <button onClick={() => setQuizActive(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground">
              <X className="w-4 h-4" />
            </button>

            {quizDone ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Mission Complete!</h3>
                <p className="text-muted-foreground mb-2">You scored {score}/{quizQuestions.length}</p>
                <p className="text-primary font-semibold text-lg mb-6">+{score * 5} points earned!</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={startQuiz} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
                    Play Again
                  </button>
                  <button onClick={() => setQuizActive(false)} className="px-6 py-2.5 rounded-xl border border-border/50 text-muted-foreground text-sm">
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-widest text-primary">Daily Mission</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{currentQ + 1}/{quizQuestions.length}</span>
                </div>

                <p className="text-[10px] text-primary/60 uppercase tracking-wider mb-1">{quizQuestions[currentQ].subject}</p>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">{quizQuestions[currentQ].q}</h3>

                <div className="grid grid-cols-2 gap-3">
                  {quizQuestions[currentQ].options.map((opt, idx) => {
                    const isCorrect = idx === quizQuestions[currentQ].answer;
                    const isSelected = answered === idx;
                    let cls = "bg-secondary/40 text-foreground border border-border/30 hover:border-primary/40";
                    if (answered !== null) {
                      if (isCorrect) cls = "bg-primary/20 text-primary border border-primary/50";
                      else if (isSelected && !isCorrect) cls = "bg-destructive/15 text-destructive border border-destructive/40";
                    }
                    return (
                      <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered !== null}
                        className={`p-4 rounded-xl text-sm font-medium transition-all ${cls}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Progress dots */}
                <div className="flex gap-1.5 justify-center mt-6">
                  {quizQuestions.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentQ ? "bg-primary w-6" : i < currentQ ? "bg-primary/40" : "bg-secondary"}`} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-10 max-w-2xl w-full glow-box relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">{grade}</span>
              </div>

              <h2 className="font-display text-3xl font-bold text-foreground mb-3">Welcome back, {name}</h2>
              <p className="text-muted-foreground text-base mb-8 max-w-md">
                {videosWatched > 0
                  ? `You've watched ${videosWatched} videos. Complete daily missions to earn points!`
                  : "Complete daily missions to earn points and climb the ranks."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4 neon-border">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Subjects</span>
                  </div>
                  <p className="font-display font-semibold text-foreground text-sm">{selectedSubjects.join(", ") || "None selected"}</p>
                </div>
                <div className="glass rounded-xl p-4 neon-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Your Points</span>
                  </div>
                  <p className="font-display font-semibold text-foreground">{profile?.points ?? 0} pts</p>
                </div>
              </div>

              {/* Subject Picker */}
              <div className="mb-6">
                <button onClick={() => setShowSubjectPicker(!showSubjectPicker)}
                  className="text-xs text-primary hover:underline mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {showSubjectPicker ? "Hide" : "Choose"} subjects for missions
                </button>
                <AnimatePresence>
                  {showSubjectPicker && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ALL_SUBJECTS.map(s => (
                          <button key={s} onClick={() => toggleSubject(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedSubjects.includes(s) ? "bg-primary/15 text-primary neon-border-active" : "bg-secondary/40 text-muted-foreground border border-border/30"
                            }`}>{s}</button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startQuiz}
                className="w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground glow-box-strong text-base">
                <Target className="w-5 h-5" /> Start Daily Mission
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full mt-6">
        {[
          { label: "Flashcards", count: "Study Cards", icon: Layers, path: "/dashboard/flashcards" },
          { label: "Video Hub", count: `${videosWatched} watched`, icon: PlayCircle, path: "/dashboard/videos" },
          { label: "Study Notes", count: "Your Desk", icon: StickyNote, path: "/dashboard/desk" },
          { label: "Olympiad Prep", count: "Coming Soon", icon: Trophy, path: "/dashboard/olympiads" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            onClick={() => navigate(item.path)}
            className="glass rounded-xl p-4 cursor-pointer hover:neon-border-active transition-all duration-200 group">
            <item.icon className="w-6 h-6 text-primary mb-2" />
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.count}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Workstation;
