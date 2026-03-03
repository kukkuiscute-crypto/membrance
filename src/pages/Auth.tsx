import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MouseGlow from "@/components/MouseGlow";
import { User } from "lucide-react";

type Mode = "login" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showLite, setShowLite] = useState(false);
  const [liteName, setLiteName] = useState("");
  const [liteUsername, setLiteUsername] = useState("");
  const [liteDisplayName, setLiteDisplayName] = useState("");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email for a confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const handleGuest = () => {
    localStorage.setItem("membrance_guest", "true");
    navigate("/onboarding");
  };

  const handleLite = () => {
    if (!liteName || !liteUsername) { toast.error("Name and username required"); return; }
    localStorage.setItem("membrance_guest", "lite");
    localStorage.setItem("membrance_profile", JSON.stringify({
      name: liteName,
      username: liteUsername,
      display_name: liteDisplayName || liteName,
      isLite: true,
    }));
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <MouseGlow />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-10 w-full max-w-md glow-box relative z-10"
      >
        <h1 className="font-display text-3xl font-bold text-foreground glow-text text-center mb-2 tracking-[0.2em]">
          MEMBRANCE
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-border/50 text-foreground hover:border-primary/30 py-3 rounded-xl transition-all text-sm font-medium mb-4 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-card/60 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={loading} type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors glow-box-strong disabled:opacity-50"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-card/60 text-muted-foreground">or</span></div>
        </div>

        {/* Lite Account */}
        {showLite ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
            <input value={liteName} onChange={e => setLiteName(e.target.value)} placeholder="Your name"
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={liteUsername} onChange={e => setLiteUsername(e.target.value)} placeholder="Username"
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={liteDisplayName} onChange={e => setLiteDisplayName(e.target.value)} placeholder="Display name (optional)"
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLite}
              className="w-full bg-primary/15 text-primary border border-primary/30 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> Continue with Lite Account
            </motion.button>
            <button onClick={() => setShowLite(false)} className="w-full text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </motion.div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowLite(true)}
              className="flex-1 border border-primary/30 text-primary hover:bg-primary/10 py-3 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> Lite Account
            </button>
            <button onClick={handleGuest}
              className="flex-1 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 py-3 rounded-xl transition-all text-sm">
              Guest Mode
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
