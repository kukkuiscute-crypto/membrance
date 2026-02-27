import { motion } from "framer-motion";
import { Layers, Trophy, Video, BookOpen, BarChart3, Settings } from "lucide-react";

const navItems = [
  { icon: Layers, label: "Flashcards", active: true },
  { icon: Trophy, label: "Olympiads", active: false },
  { icon: Video, label: "Live Classes", active: false },
  { icon: BookOpen, label: "Study Notes", active: false },
  { icon: BarChart3, label: "Progress", active: false },
];

const DashboardSidebar = () => {
  return (
    <aside className="w-64 h-screen glass-strong flex flex-col py-8 px-4 border-r border-border/30 shrink-0">
      {/* Logo */}
      <div className="px-4 mb-10">
        <h1 className="font-display text-xl font-bold tracking-[0.25em] text-foreground glow-text">
          MEMBRANCE
        </h1>
        <div className="h-0.5 w-12 bg-primary/60 mt-2 rounded-full" />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
              item.active
                ? "bg-primary/15 text-primary neon-border-active glow-box"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Bottom */}
      <button className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60">
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </aside>
  );
};

export default DashboardSidebar;
