export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export const XIAOCOO_API_PATH = "/api/xiaocoo";
export const XIAOCOO_DEVICE_ID_KEY = "xiaocoo-device-id";

export function getXiaocooApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_XIAOCOO_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return XIAOCOO_API_PATH;
}

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(XIAOCOO_DEVICE_ID_KEY)?.trim();
    if (existing) return existing.slice(0, 64);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(XIAOCOO_DEVICE_ID_KEY, id);
    return id;
  } catch {
    return "anonymous";
  }
}

export async function streamXiaocooChat(
  messages: ChatMessage[],
  options?: {
    signal?: AbortSignal;
    language?: "zh" | "en";
    visitorName?: string;
    deviceId?: string;
  }
): Promise<Response> {
  const url = getXiaocooApiUrl();
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.filter((m) => m.role === "user" || m.role === "assistant"),
      language: options?.language ?? "zh",
      visitorName: options?.visitorName?.trim() || undefined,
      deviceId: options?.deviceId?.trim() || undefined,
    }),
    signal: options?.signal,
  });
}

/** Parse OpenAI-compatible SSE and yield text deltas. */
export async function* readOpenAiSseStream(
  response: Response
): AsyncGenerator<string> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
          error?: { message?: string };
        };
        if (json.error?.message) {
          throw new Error(json.error.message);
        }
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (err) {
        if (err instanceof SyntaxError) continue;
        throw err;
      }
    }
  }
}
