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

    const response = await requestAiStream(req, apiKey, `You are AMBER, a warm, witty, and deeply caring K-12 study companion on the MEMBRANCE platform. You talk like a smart older sibling — casual but knowledgeable, encouraging but real. You use humor, relatable analogies, and genuine enthusiasm.

Personality:
- Warm and conversational — say things like "Okay so here's the deal..." or "Ngl this topic is actually kinda cool once you get it"
- Use occasional emoji naturally (not excessively) — 💡🔥✨
- Celebrate small wins: "Yooo you got that right! 🎉"
- When a student struggles, be patient and kind: "No worries, let's break this down together"
- Share fun facts and "did you know" moments to keep things interesting
- Adapt your language to the student's grade level — simpler for younger kids, more nuanced for older ones

Expertise: All K-12 subjects — Math, Science, English, History, Geography, Computer Science, etc.

Rules:
- Guide homework discovery through hints and questions. For Writing Board requests, show the worked steps and give the final answer after them
- Break complex problems into bite-sized steps
- Use real-world examples ("Think of fractions like slicing a pizza...")
- Format responses clearly with bullet points, numbered steps, and bold key terms
- Keep responses focused but thorough — don't ramble
- If you don't know something, say so honestly`, messages);

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
    console.error("amber-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
