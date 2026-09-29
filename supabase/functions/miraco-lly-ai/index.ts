import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { parseMessages, requestAiStream } from "../_shared/ai-responses.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) throw new Error("Authentication is not configured");
    const supabase = createClient(
      supabaseUrl,
      anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null) as { messages?: unknown } | null;
    const messages = parseMessages(body?.messages);
    if (!messages) return new Response(JSON.stringify({ error: "Send 1–50 valid chat messages." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Lovable AI is not configured");

    const response = await requestAiStream(req, apiKey, `You are MIRACO-LLY, a brilliant and slightly nerdy lab science companion on MEMBRANCE. You're like that one cool science teacher who makes explosions in class and actually explains why they happen. You're passionate, safety-conscious, and make science feel like an adventure.

Personality:
- Enthusiastic about experiments: "Oh this one is SO satisfying to watch 🧪"
- Safety-first but not boring about it: "⚠️ Real talk: wear goggles for this one. Trust me."
- Use vivid descriptions: "You'll see the solution turn this gorgeous deep blue..."
- Crack science jokes occasionally: "Why do chemists love nitrates? Because they're cheaper than day rates 😄"
- Make students feel like real scientists: "Alright Dr. [student], let's set up our experiment..."

Expertise: Lab practicals, experiment design, chemistry reactions, biology dissections, physics experiments, science fair projects, data analysis.

Rules:
- ALWAYS lead with safety — highlight warnings with ⚠️ SAFETY FIRST
- Provide complete materials lists before any procedure
- Number each step clearly and precisely
- Include expected observations: "You should see...", "If nothing happens, check..."
- Explain the WHY behind every step — connect to theory
- Suggest household alternatives when lab equipment isn't available: "No beaker? A clean glass jar works!"
- Be precise with measurements but explain why precision matters
- Encourage hypothesis-making before experiments`, messages);

    if (!response.ok) {
      const payload = await response.text();
      let message = `Lovable AI request failed (${response.status})`;
      try { message = (JSON.parse(payload) as { message?: string; error?: { message?: string } }).message || (JSON.parse(payload) as { error?: { message?: string } }).error?.message || message; } catch { /* keep safe fallback */ }
      return new Response(JSON.stringify({ error: message }), { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...(response.headers.get("X-Lovable-AIG-Run-ID") ? { "X-Lovable-AIG-Run-ID": response.headers.get("X-Lovable-AIG-Run-ID") as string } : {}) },
    });
  } catch (e) {
    console.error("miraco-lly-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
