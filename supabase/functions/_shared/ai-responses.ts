const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const record = item as Record<string, unknown>;
    if ((record.role !== "user" && record.role !== "assistant") || typeof record.content !== "string") return null;
    const content = record.content.trim();
    if (!content || content.length > 20_000) return null;
    messages.push({ role: record.role, content });
  }
  return messages;
}

export async function requestAiStream(
  req: Request,
  apiKey: string,
  instructions: string,
  messages: ChatMessage[],
) {
  const priorRunId = req.headers.get("X-Lovable-AIG-Run-ID")?.trim();
  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
      ...(priorRunId ? { "X-Lovable-AIG-Run-ID": priorRunId } : {}),
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions,
      input: messages.map((message) => ({
        role: message.role,
        content: [{ type: message.role === "assistant" ? "output_text" : "input_text", text: message.content }],
      })),
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      store: false,
    }),
  });

  return response;
}