import { motion, AnimatePresence } from "framer-motion";
import { Layers, Trophy, Video, BookOpen, Settings, ChevronLeft, ChevronRight, Shield, PlayCircle, FolderOpen, Users, BarChart3, User, X, Calendar, ClipboardCheck, GraduationCap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RankBadge from "@/components/RankBadge";

const navItems = [
  { icon: BookOpen, label: "Workstation", path: "/dashboard" },
  { icon: Layers, label: "Flashcards", path: "/dashboard/flashcards" },
  { icon: PlayCircle, label: "Video Hub", path: "/dashboard/videos" },
  { icon: FolderOpen, label: "Your Desk", path: "/dashboard/desk" },
  { icon: Users, label: "Communities", path: "/dashboard/communities" },
  { icon: BarChart3, label: "Leaderboard", path: "/dashboard/leaderboard" },
  { icon: ClipboardCheck, label: "Study Tracker", path: "/dashboard/tracker" },
  { icon: GraduationCap, label: "Study Helper", path: "/dashboard/helper" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: Trophy, label: "Olympiads", path: "/dashboard/olympiads", badge: "Soon" },
  { icon: Video, label: "Live Classes", path: "/dashboard/live", badge: "Soon" },
  { icon: Shield, label: "Rankings", path: "/dashboard/rankings" },
  { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
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
    <>
      {/* Desktop sidebar */}
      <aside className={`h-screen glass-strong flex-col py-5 border-r border-border/30 shrink-0 transition-all duration-300 ${collapsed ? "w-16 px-2" : "w-56 px-3"} hidden md:flex`}>
        <div className={`flex items-center mb-5 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
          {!collapsed && <h1 className="font-display text-base font-bold tracking-[0.25em] text-foreground glow-text">MEMBRANCE</h1>}
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && <div className="h-0.5 w-10 bg-primary/60 mb-3 rounded-full mx-2" />}

        {user && profile && !collapsed && (
          <div className="px-2 mb-3">
            <RankBadge points={profile.points || 0} compact />
          </div>
        )}

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = item.path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.path);
            return (
              <motion.button key={item.label} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }} onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 ${collapsed ? "justify-center px-2" : "px-3"} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive ? "bg-primary/15 text-primary neon-border-active glow-box" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}>
                <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {!collapsed && <span className="truncate text-[13px]">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{item.badge}</span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {!collapsed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
              onClick={onToggle}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-64 glass-strong flex flex-col py-5 px-3 border-r border-border/30 z-50 md:hidden"
            >
              <div className="flex items-center justify-between px-2 mb-5">
                <h1 className="font-display text-base font-bold tracking-[0.25em] text-foreground glow-text">MEMBRANCE</h1>
                <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="h-0.5 w-10 bg-primary/60 mb-3 rounded-full mx-2" />

              {user && profile && (
                <div className="px-2 mb-3">
                  <RankBadge points={profile.points || 0} compact />
                </div>
              )}

              <nav className="flex-1 space-y-0.5 overflow-y-auto">
                {navItems.map((item, i) => {
                  const isActive = item.path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(item.path);
                  return (
                    <button key={item.label} onClick={() => { navigate(item.path); onToggle(); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        isActive ? "bg-primary/15 text-primary neon-border-active glow-box" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}>
                      <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      <span className="truncate text-[13px]">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
