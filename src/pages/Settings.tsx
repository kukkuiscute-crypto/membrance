import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Palette, Save, Loader2, StickyNote, BookOpen, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, THEMES, type ThemeKey } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, isGuest, profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteView, setNoteView] = useState<"sticky" | "book">(() => {
    return (localStorage.getItem("membrance_note_view") as "sticky" | "book") || "sticky";
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
    }
  }, [profile]);

  const canChangeUsername = () => {
    if (!profile?.username_changed_at) return true;
    const lastChange = new Date(profile.username_changed_at);
    const daysSince = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = { display_name: displayName };
      if (username !== (profile?.username || "") && canChangeUsername()) {
        updates.username = username || null;
        updates.username_changed_at = new Date().toISOString();
      }
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile saved!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("membrance_guest");
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const toggleNoteView = (view: "sticky" | "book") => {
    setNoteView(view);
    localStorage.setItem("membrance_note_view", view);
    toast.success(`Note view set to ${view === "sticky" ? "Sticky Notes" : "Book Notes"}`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your MEMBRANCE experience</p>
      </div>

      {/* Profile Section — auth users only */}
      {user && !isGuest && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Profile</h3>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Display Name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Username {!canChangeUsername() && <span className="text-destructive">(changeable in 30 days)</span>}
            </label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={!canChangeUsername()}
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" placeholder="@username" />
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </motion.div>
      )}

      {isGuest && (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">Sign in with Google to edit your profile and unlock rankings.</p>
        </div>
      )}

      {/* Theme Engine */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Theme</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)}
              className={`flex items-center gap-2.5 p-3 rounded-lg text-sm transition-all ${
                theme === t.key ? "neon-border-active bg-primary/10 text-primary" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
              }`}>
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: `hsl(${t.hue})` }} />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Note View Toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Note View</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "sticky" as const, label: "Sticky Notes", desc: "Wall of sticky notes above desk", icon: StickyNote },
            { value: "book" as const, label: "Book Notes", desc: "Margin-indented book layout", icon: BookOpen },
          ].map((opt) => (
            <button key={opt.value} onClick={() => toggleNoteView(opt.value)}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                noteView === opt.value ? "bg-primary/15 text-primary neon-border-active glow-box" : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
              }`}>
              <opt.icon className="w-5 h-5" />
              <div className="text-left">
                <span className="font-medium text-sm block">{opt.label}</span>
                <span className="text-xs opacity-70">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Log Out */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full justify-center border border-destructive/40 text-destructive hover:bg-destructive/10 py-3 rounded-xl transition-all text-sm font-medium">
          <LogOut className="w-4 h-4" />
          {user ? "Log Out" : "Exit Guest Mode"}
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;
