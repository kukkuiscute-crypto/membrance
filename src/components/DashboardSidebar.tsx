import { motion } from "framer-motion";
import { Layers, Trophy, Video, BookOpen, Settings, ChevronLeft, ChevronRight, Shield, PlayCircle, FolderOpen, Users, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RankBadge from "@/components/RankBadge";

const navItems = [
  { icon: BookOpen, label: "Workstation", path: "/dashboard" },
  { icon: Layers, label: "Flashcards", path: "/dashboard/flashcards" },
  { icon: PlayCircle, label: "Video Hub", path: "/dashboard/videos" },
  { icon: FolderOpen, label: "Your Desk", path: "/dashboard/desk" },
  { icon: Users, label: "Communities", path: "/dashboard/communities" },
  { icon: BarChart3, label: "Leaderboard", path: "/dashboard/leaderboard", authOnly: true },
  { icon: Trophy, label: "Olympiads", path: "/dashboard/olympiads", badge: "Soon" },
  { icon: Video, label: "Live Classes", path: "/dashboard/live", badge: "Soon" },
  { icon: Shield, label: "Rankings", path: "/dashboard/rankings", authOnly: true },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest, profile } = useAuth();

  return (
    <aside
      className={`h-screen glass-strong flex flex-col py-6 border-r border-border/30 shrink-0 transition-all duration-300 ${
        collapsed ? "w-20 px-2" : "w-64 px-4"
      } hidden md:flex`}
    >
      <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        {!collapsed && (
          <h1 className="font-display text-lg font-bold tracking-[0.25em] text-foreground glow-text">
            MEMBRANCE
          </h1>
        )}
        <button onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && <div className="h-0.5 w-12 bg-primary/60 mb-4 rounded-full mx-2" />}

      {!isGuest && user && profile && !collapsed && (
        <div className="px-2 mb-4">
          <RankBadge points={profile.points || 0} compact />
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          if ((item as any).authOnly && (isGuest || !user)) return null;
          const isActive = item.path === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(item.path);
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
    </aside>
  );
};

export default DashboardSidebar;
