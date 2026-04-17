import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MouseGlow from "@/components/MouseGlow";
import { AtSign, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  const checkUsernameAvailable = async (uname: string): Promise<boolean> => {
    const { data } = await supabase.from("profiles").select("id").eq("username", uname).maybeSingle();
    return !data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!username || !password) throw new Error("Username and password required");
      if (username.length < 3) throw new Error("Username must be at least 3 characters");
      if (!/^[A-Za-z0-9]+$/.test(username)) throw new Error("Username: English letters & numbers only — no spaces, symbols, or emojis");
      if (!/[A-Z]/.test(username)) throw new Error("Username must contain at least one uppercase letter");
      const fakeEmail = `${username.toLowerCase()}@membrance.local`;

      if (mode === "signup") {
        const available = await checkUsernameAvailable(username);
        if (!available) throw new Error("Username is already taken. Choose another.");
        const { error } = await supabase.auth.signUp({ email: fakeEmail, password });
        if (error) throw error;
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          await supabase.from("profiles").update({ username, display_name: username }).eq("user_id", newUser.id);
        }
        toast.success("Account created! Welcome to MEMBRANCE.");
        navigate("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
        if (error) throw new Error("Invalid username or password");
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
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
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

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <MouseGlow />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 w-full max-w-md glow-box relative z-10">
        <h1 className="font-display text-3xl font-bold text-foreground glow-text text-center mb-1 tracking-[0.2em]">MEMBRANCE</h1>
        <p className="text-muted-foreground text-center text-sm mb-6">{mode === "login" ? "Welcome back" : "Create your account"}</p>

        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-border/50 text-foreground hover:border-primary/30 py-3 rounded-xl transition-all text-sm font-medium mb-4 disabled:opacity-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-card/60 text-muted-foreground">or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block flex items-center gap-1">
              <AtSign className="w-3 h-3" /> Username
            </label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} minLength={3}
              pattern="[A-Za-z0-9]+"
              className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="CoolStudent123" />
            <p className="text-[10px] text-muted-foreground mt-1">English letters & numbers only · at least 1 uppercase · no spaces/symbols</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary/60 border border-border/50 rounded-lg px-4 py-3 pr-10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors glow-box-strong disabled:opacity-50">
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
          </motion.button>
        </form>

        <div className="mt-3 text-center">
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-card/60 text-muted-foreground">or</span></div>
        </div>

        <button onClick={handleGuest}
          className="w-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 py-3 rounded-xl transition-all text-sm">
          Continue as Guest
        </button>
      </motion.div>
    </div>
  );
};

export default Auth;
