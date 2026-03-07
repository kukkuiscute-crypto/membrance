import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, ClipboardCheck, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudyTracker = () => {
  const { user, isGuest } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    if (user && !isGuest) {
      const { data } = await supabase.from("daily_tasks").select("*").eq("user_id", user.id).eq("task_date", today).order("start_time");
      setTasks(data || []);
    } else {
      const saved = JSON.parse(localStorage.getItem("membrance_daily_tasks") || "[]");
      setTasks(saved.filter((t: any) => t.task_date === today));
    }
    setLoading(false);
  };

  const toggleTask = async (task: any) => {
    const newCompleted = !task.completed;
    if (user && !isGuest) {
      await supabase.from("daily_tasks").update({ completed: newCompleted }).eq("id", task.id);
    } else {
      const all = JSON.parse(localStorage.getItem("membrance_daily_tasks") || "[]");
      const idx = all.findIndex((t: any) => t.id === task.id);
      if (idx >= 0) { all[idx].completed = newCompleted; localStorage.setItem("membrance_daily_tasks", JSON.stringify(all)); }
    }
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));
  };

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardCheck className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Study Tracker</h2>
          <p className="text-sm text-muted-foreground">Have you completed your daily routine?</p>
        </div>
      </div>

      {/* Progress */}
      <div className="glass rounded-xl p-6 glow-box mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Today's Progress</p>
          <span className="text-lg font-bold text-primary">{percentage}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-primary" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{completed} of {total} tasks completed</p>
        {total === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            No daily tasks found for today. Add tasks in the <span className="text-primary">Calendar Planner</span> → Daily Routine tab.
          </p>
        )}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {loading ? (
          <div className="glass rounded-xl p-8 text-center"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
        ) : tasks.length > 0 ? (
          tasks.map((task, i) => (
            <motion.div key={task.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => toggleTask(task)}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                task.completed ? "glass border border-primary/20 bg-primary/5" : "glass border border-border/30 hover:border-primary/30"
              }`}>
              {task.completed ? (
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? "text-primary line-through" : "text-foreground"}`}>{task.title}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{task.start_time?.slice(0, 5)} – {task.end_time?.slice(0, 5)}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass rounded-xl p-8 text-center">
            <ClipboardCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tasks for today. Set up your daily routine in Calendar Planner!</p>
          </div>
        )}
      </div>

      {percentage === 100 && total > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-xl p-6 text-center glow-box mt-6">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-foreground font-bold">All tasks completed! Great work today!</p>
        </motion.div>
      )}
    </div>
  );
};

export default StudyTracker;
