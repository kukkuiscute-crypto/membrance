import { motion } from "framer-motion";
import { Layers, Trophy, Video, BookOpen, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Layers, label: "Flashcards", path: "/dashboard/flashcards" },
  { icon: Trophy, label: "Olympiads", path: "/dashboard/olympiads", badge: "Soon" },
  { icon: Video, label: "Live Classes", path: "/dashboard/live", badge: "Soon" },
  { icon: BookOpen, label: "Study Notes", path: "/dashboard" },
  { icon: BarChart3, label: "Progress", path: "/dashboard" },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`h-screen glass-strong flex flex-col py-6 border-r border-border/30 shrink-0 transition-all duration-300 ${
        collapsed ? "w-20 px-2" : "w-64 px-4"
      }`}
    >
      {/* Logo + Toggle */}
      <div className={`flex items-center mb-8 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        {!collapsed && (
          <h1 className="font-display text-lg font-bold tracking-[0.25em] text-foreground glow-text">
            MEMBRANCE
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && <div className="h-0.5 w-12 bg-primary/60 mb-6 rounded-full mx-2" />}

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 ${collapsed ? "justify-center px-2" : "px-4"} py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/15 text-primary neon-border-active glow-box"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <button className={`flex items-center gap-3 ${collapsed ? "justify-center px-2" : "px-4"} py-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60`}>
        <Settings className="w-5 h-5" />
        {!collapsed && <span>Settings</span>}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
