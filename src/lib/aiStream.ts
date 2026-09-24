import { supabase } from "@/integrations/supabase/client";

type AiMessage = { role: "user" | "assistant"; content: string };

const textFromEvent = (event: Record<string, unknown>) => {
  if (event.type === "response.output_text.delta" && typeof event.delta === "string") return event.delta;
  const choices = event.choices;
  if (!Array.isArray(choices)) return "";
  const first = choices[0] as { delta?: { content?: string } } | undefined;
  return first?.delta?.content ?? "";
};

const readError = async (response: Response) => {
  const fallback = `AI request failed (${response.status})`;
  try {
    const payload = await response.json() as { error?: string | { message?: string }; message?: string };
    if (typeof payload.error === "string") return payload.error;
    if (typeof payload.error?.message === "string") return payload.error.message;
    return payload.message || fallback;
  } catch {
    return fallback;
  }
};

export async function streamAiResponse(
  functionName: string,
  messages: AiMessage[],
  onDelta?: (text: string, fullText: string) => void,
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Sign in with your username to use AI tools.");

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  if (!projectId) throw new Error("AI tools are not configured for this app.");

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) throw new Error(await readError(response));
  if (!response.body) throw new Error("The AI response stream was unavailable.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  const consume = (line: string) => {
    if (!line.startsWith("data:")) return;
    const value = line.slice(5).trim();
    if (!value || value === "[DONE]") return;
    try {
      const delta = textFromEvent(JSON.parse(value) as Record<string, unknown>);
      if (!delta) return;
      fullText += delta;
      onDelta?.(delta, fullText);
    } catch {
      // A partial SSE frame remains buffered until the next network chunk.
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    lines.forEach(consume);
  }
  if (buffer.trim()) consume(buffer);
  if (!fullText.trim()) throw new Error("The AI finished without an answer. Please try again.");
  return fullText.trim();
}