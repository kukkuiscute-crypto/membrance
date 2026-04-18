import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MouseGlow from "@/components/MouseGlow";
import { User as UserIcon, LogIn, Plus, Loader2 } from "lucide-react";

interface LinkedAccount {
  user_id: string;
  google_email: string;
  is_primary: boolean;
  profile?: { username: string | null; display_name: string | null };
}

const AccountHub = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleSub, setGoogleSub] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    void load();
  }, [authLoading, user]);

  const load = async () => {
    setLoading(true);
    try {
      // Get the Google identity from the current session
      const { data: { session } } = await supabase.auth.getSession();
      const identities = session?.user?.identities ?? [];
      const google = identities.find((i) => i.provider === "google");
      const sub = google?.id ?? google?.identity_data?.sub ?? null;
      const email = (google?.identity_data as any)?.email ?? session?.user?.email ?? null;
      setGoogleSub(sub);
      setGoogleEmail(email);

      if (!sub) {
        // Not signed in via Google — just show the current account
        setAccounts([]);
        return;
      }

      // Make sure the current account is linked to this Google identity
      await supabase.from("google_account_links").upsert(
        { user_id: user!.id, google_sub: sub, google_email: email ?? "" },
        { onConflict: "user_id,google_sub" },
      );

      // Find every MEMBRANCE account that shares this Google identity
      const { data: links } = await supabase
        .from("google_account_links")
        .select("user_id, google_email, is_primary")
        .eq("google_sub", sub);

      const userIds = (links ?? []).map((l) => l.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      setAccounts(
        (links ?? []).map((l) => ({
          ...l,
          profile: profileMap.get(l.user_id) ?? undefined,
        })),
      );
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load linked accounts");
    } finally {
      setLoading(false);
    }
  };

  const useThisAccount = (uid: string) => {
    if (uid === user?.id) {
      navigate("/dashboard");
      return;
    }
    // Switching to a different MEMBRANCE account requires a re-auth (we don't
    // have stored credentials for the other account). Send the user to /auth
    // with a hint so they can sign in.
    setSwitching(uid);
    toast.info("Sign in to that account to continue");
    navigate("/auth");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MouseGlow />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-lg glow-box relative z-10"
      >
        <h1 className="font-display text-2xl font-bold text-foreground glow-text text-center mb-1 tracking-wider">
          ACCOUNT HUB
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-6">
          {googleEmail ? <>Signed in via Google as <span className="text-primary">{googleEmail}</span></> : "Choose an account"}
        </p>

        <div className="space-y-2">
          {accounts.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
              No linked accounts yet. The current account will be linked automatically.
            </div>
          )}
          {accounts.map((a) => {
            const isCurrent = a.user_id === user?.id;
            return (
              <button
                key={a.user_id}
                onClick={() => useThisAccount(a.user_id)}
                disabled={switching === a.user_id}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? "border-primary/50 bg-primary/10 text-foreground glow-box"
                    : "border-border/40 bg-secondary/40 hover:border-primary/30 text-foreground"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {a.profile?.display_name || a.profile?.username || "Account"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{a.profile?.username ?? "—"} · {a.google_email}
                  </div>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] uppercase tracking-wider text-primary">Current</span>
                ) : (
                  <LogIn className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl text-sm font-semibold glow-box-strong"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth");
            }}
            className="w-full border border-border/40 text-muted-foreground hover:text-foreground py-3 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add a new MEMBRANCE account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountHub;
