import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalIcon, Plus, X, Clock, CheckCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";

type PlannerMode = "monthly" | "weekly" | "one_time" | "daily";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm

const CalendarPlanner = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<PlannerMode>("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [isDayOff, setIsDayOff] = useState(false);

  useEffect(() => { if (user) { fetchEvents(); fetchDailyTasks(); } }, [user, currentDate]);

  const fetchEvents = async () => {
    if (!user) return;
    const { data } = await supabase.from("calendar_events").select("*").eq("user_id", user.id).order("event_date");
    if (data) setEvents(data);
  };

  const fetchDailyTasks = async () => {
    if (!user) return;
    const dateStr = format(selectedDate || new Date(), "yyyy-MM-dd");
    const { data } = await supabase.from("daily_tasks").select("*").eq("user_id", user.id).eq("task_date", dateStr).order("start_time");
    if (data) setDailyTasks(data);
  };

  useEffect(() => { if (user && mode === "daily") fetchDailyTasks(); }, [selectedDate, mode]);

  const addEvent = async () => {
    if (!user || !newTitle.trim()) { toast.error("Title required"); return; }
    if (mode === "daily") {
      const { error } = await supabase.from("daily_tasks").insert({
        user_id: user.id, title: newTitle, start_time: newStartTime, end_time: newEndTime,
        task_date: format(selectedDate || new Date(), "yyyy-MM-dd"),
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Task added!"); fetchDailyTasks();
    } else {
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id, title: newTitle, description: newDesc,
        event_type: mode, event_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
        start_time: newStartTime, end_time: newEndTime, is_day_off: isDayOff,
        repeat_mode: mode === "weekly" ? "weekly" : mode === "monthly" ? "monthly" : "none",
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Event added!"); fetchEvents();
    }
    setShowAdd(false); setNewTitle(""); setNewDesc(""); setIsDayOff(false);
  };

  const deleteEvent = async (id: string, table: "calendar_events" | "daily_tasks") => {
    if (!user) return;
    await supabase.from(table).delete().eq("id", id);
    toast.success("Deleted"); table === "daily_tasks" ? fetchDailyTasks() : fetchEvents();
  };

  const toggleTask = async (id: string, completed: boolean) => {
    if (!user) return;
    await supabase.from("daily_tasks").update({ completed: !completed }).eq("id", id);
    fetchDailyTasks();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: addDays(endOfMonth(currentDate), 6 - endOfMonth(currentDate).getDay()) });

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDate = (date: Date) => events.filter(e => e.event_date && isSameDay(new Date(e.event_date), date));

  const modes: { key: PlannerMode; label: string; desc: string }[] = [
    { key: "monthly", label: "📅 Monthly", desc: "Mark days off & reminders" },
    { key: "weekly", label: "📋 Weekly", desc: "Custom weekly plan" },
    { key: "one_time", label: "⏰ One-Time", desc: "Single day routine" },
    { key: "daily", label: "🕐 Daily", desc: "Timeline & tasks" },
  ];

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="glass rounded-xl p-10 text-center glow-box">
          <CalIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sign in with a username account to use the Calendar Planner</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Calendar Planner</h2>
          <p className="text-sm text-muted-foreground">Plan your study schedule</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {modes.map(m => (
          <button key={m.key} onClick={() => { setMode(m.key); setSelectedDate(null); }}
            className={`p-3 rounded-xl text-left transition-all ${mode === m.key ? "glass neon-border-active glow-box" : "glass border border-border/30 hover:border-primary/30"}`}>
            <p className="text-sm font-medium text-foreground">{m.label}</p>
            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Calendar Grid */}
        <div className="flex-1">
          {(mode === "monthly" || mode === "one_time") && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
                <h3 className="font-display font-semibold text-foreground">{format(currentDate, "MMMM yyyy")}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dayEvents = getEventsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const hasDayOff = dayEvents.some(e => e.is_day_off);
                  return (
                    <button key={i} onClick={() => { setSelectedDate(day); setShowAdd(false); }}
                      className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                        !isSameMonth(day, currentDate) ? "text-muted-foreground/30" :
                        isSelected ? "bg-primary/20 text-primary neon-border-active" :
                        isToday ? "bg-primary/10 text-primary" :
                        hasDayOff ? "bg-destructive/10 text-destructive" :
                        "text-foreground hover:bg-secondary/40"
                      }`}>
                      <span>{format(day, "d")}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5">
                          {dayEvents.slice(0, 3).map((_, j) => (
                            <div key={j} className="w-1 h-1 rounded-full bg-primary" />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "weekly" && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentDate(addDays(currentDate, -7))}
                  className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
                <h3 className="font-display font-semibold text-foreground">Week of {format(weekStart, "MMM d")}</h3>
                <button onClick={() => setCurrentDate(addDays(currentDate, 7))}
                  className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {weekDays.map((day, i) => {
                  const dayEvents = getEventsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <button key={i} onClick={() => setSelectedDate(day)}
                      className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                        isSelected ? "glass neon-border-active" : isToday ? "glass border border-primary/30" : "bg-secondary/20 border border-border/20 hover:border-primary/20"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-center w-10">
                          <p className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE")}</p>
                          <p className="text-sm font-semibold text-foreground">{format(day, "d")}</p>
                        </div>
                        <div className="flex gap-1">
                          {dayEvents.map(e => (
                            <span key={e.id} className={`text-[10px] px-2 py-0.5 rounded-full ${e.is_day_off ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                              {e.title}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "daily" && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">
                  {format(selectedDate || new Date(), "EEEE, MMMM d")}
                </h3>
                <button onClick={() => { setSelectedDate(new Date()); }}
                  className="text-xs px-3 py-1 rounded-lg bg-primary/15 text-primary">Today</button>
              </div>
              {/* Timeline */}
              <div className="space-y-0.5 relative">
                {HOURS.map(hour => {
                  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                  const tasksAtHour = dailyTasks.filter(t => {
                    const startH = parseInt(t.start_time?.split(":")[0] || "0");
                    return startH === hour;
                  });
                  return (
                    <div key={hour} className="flex gap-3 group min-h-[3rem]">
                      <span className="text-[10px] text-muted-foreground w-10 text-right pt-1 shrink-0">{timeStr}</span>
                      <div className="flex-1 border-l border-border/30 pl-3 py-1">
                        {tasksAtHour.map(task => (
                          <div key={task.id}
                            className={`flex items-center justify-between p-2 rounded-lg mb-1 ${task.completed ? "bg-primary/10 line-through opacity-60" : "bg-secondary/30"}`}>
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleTask(task.id, task.completed)}>
                                <CheckCircle className={`w-4 h-4 ${task.completed ? "text-primary" : "text-muted-foreground"}`} />
                              </button>
                              <div>
                                <p className="text-xs font-medium text-foreground">{task.title}</p>
                                <p className="text-[9px] text-muted-foreground">{task.start_time} – {task.end_time}</p>
                              </div>
                            </div>
                            <button onClick={() => deleteEvent(task.id, "daily_tasks")} className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {tasksAtHour.length === 0 && (
                          <button onClick={() => { setNewStartTime(timeStr); setNewEndTime(`${(hour + 1).toString().padStart(2, "0")}:00`); setShowAdd(true); }}
                            className="w-full text-left text-[10px] text-muted-foreground/40 hover:text-muted-foreground py-1 transition-colors opacity-0 group-hover:opacity-100">
                            + Add task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-72 shrink-0 space-y-3">
          {selectedDate && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">{format(selectedDate, "MMM d, yyyy")}</h4>
                <button onClick={() => setShowAdd(true)}
                  className="p-1 rounded-lg bg-primary/15 text-primary hover:bg-primary/25"><Plus className="w-4 h-4" /></button>
              </div>
              {getEventsForDate(selectedDate).length === 0 && mode !== "daily" && (
                <p className="text-xs text-muted-foreground">No events. Click + to add.</p>
              )}
              {getEventsForDate(selectedDate).map(e => (
                <div key={e.id} className={`p-2 rounded-lg mb-1 ${e.is_day_off ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/30 border border-border/20"}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{e.title}</p>
                    <button onClick={() => deleteEvent(e.id, "calendar_events")} className="p-0.5 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {e.start_time && <p className="text-[9px] text-muted-foreground">{e.start_time} – {e.end_time}</p>}
                  {e.is_day_off && <span className="text-[9px] text-destructive">Day Off</span>}
                  {e.description && <p className="text-[9px] text-muted-foreground mt-1">{e.description}</p>}
                </div>
              ))}
            </div>
          )}

          {!selectedDate && (
            <div className="glass rounded-xl p-6 text-center">
              <CalIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Select a day to manage events</p>
            </div>
          )}

          {/* Upcoming reminders */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Upcoming</h4>
            {events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center gap-2 p-1.5">
                <div className={`w-2 h-2 rounded-full ${e.is_day_off ? "bg-destructive" : "bg-primary"}`} />
                <div>
                  <p className="text-[10px] font-medium text-foreground">{e.title}</p>
                  <p className="text-[9px] text-muted-foreground">{e.event_date && format(new Date(e.event_date), "MMM d")}</p>
                </div>
              </div>
            ))}
            {events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length === 0 && (
              <p className="text-[10px] text-muted-foreground">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-sm glow-box" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {mode === "daily" ? "Add Task" : "Add Event"}
                </h3>
                <button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title"
                  className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                {mode !== "daily" && (
                  <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
                    className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Start</label>
                    <input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)}
                      className="w-full bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground uppercase">End</label>
                    <input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)}
                      className="w-full bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                {mode === "monthly" && (
                  <label className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 cursor-pointer">
                    <input type="checkbox" checked={isDayOff} onChange={e => setIsDayOff(e.target.checked)} className="rounded" />
                    <span className="text-sm text-foreground">Mark as Day Off</span>
                  </label>
                )}
                <button onClick={addEvent}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  {mode === "daily" ? "Add Task" : "Add Event"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPlanner;
