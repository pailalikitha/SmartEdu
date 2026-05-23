export type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

type CallAnthropicOptions = {
  messages: AnthropicMessage[];
  system?: string;
  maxTokens?: number;
};

export async function callAnthropic({
  messages,
  system,
  maxTokens = 1000,
}: CallAnthropicOptions): Promise<string> {
  const response = await fetch("/api/anthropic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "AI request failed.");
  }

  const data = (await response.json()) as {
    content?: { type: string; text: string }[];
  };

  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty AI response.");
  return text;
}
