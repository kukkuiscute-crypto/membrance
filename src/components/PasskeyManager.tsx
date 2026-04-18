import { useEffect, useState } from "react";
import { Fingerprint, Loader2, Trash2, Plus, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { passkeySupported, registerPasskey } from "@/lib/webauthn";

interface Passkey {
  id: string;
  device_label: string | null;
  created_at: string;
  last_used_at: string | null;
}

const PasskeyManager = () => {
  const { user, profile } = useAuth();
  const [keys, setKeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const supported = passkeySupported();

  useEffect(() => { if (user) void load(); }, [user]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("passkey_credentials")
      .select("id, device_label, created_at, last_used_at")
      .order("created_at", { ascending: false });
    setKeys(data ?? []);
    setLoading(false);
  };

  const register = async () => {
    if (!user || !supported) return;
    setRegistering(true);
    try {
      const username = profile?.username ?? user.email ?? "user";
      const displayName = profile?.display_name ?? username;
      const { credentialId, publicKey, transports } = await registerPasskey({
        userId: user.id,
        username,
        displayName,
      });

      const uaData = (navigator as any).userAgentData;
      const deviceLabel =
        uaData?.platform ??
        (navigator.userAgent.match(/\(([^)]+)\)/)?.[1] ?? "This device");

      const { error } = await supabase.from("passkey_credentials").insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKey,
        transports,
        device_label: deviceLabel,
      });
      if (error) throw error;

      toast.success("Passkey registered for this device");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to register passkey");
    } finally {
      setRegistering(false);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("passkey_credentials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Passkey removed");
    await load();
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.21 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Fingerprint className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Passkeys</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Sign in with Face ID, Touch ID, Windows Hello, or your phone — no password needed.
      </p>

      {!supported ? (
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/40 border border-border/30">
          This browser does not support passkeys.
        </div>
      ) : (
        <>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="space-y-2 mb-4">
              {keys.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No passkeys registered yet.</div>
              )}
              {keys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">{k.device_label ?? "Passkey"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Added {new Date(k.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(k.id)}
                    className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={register}
            disabled={registering}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Register a passkey for this device
          </button>
        </>
      )}
    </motion.div>
  );
};

export default PasskeyManager;
