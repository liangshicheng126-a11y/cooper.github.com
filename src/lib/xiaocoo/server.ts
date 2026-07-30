import { XIAOCOO_KNOWLEDGE } from "./bundledKnowledge";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 24;
const MAX_CONTENT_CHARS = 4000;

export function buildSystemPrompt(language: "zh" | "en" = "zh"): string {
  const langHint =
    language === "en"
      ? "Reply in English unless the user writes in Chinese."
      : "默认用简体中文回答；用户用英文提问时再用英文。";

  return [
    "你是小coo，梁世城（Cooper Liang）的个人数字分身。",
    langHint,
    "严格依据下方知识库作答，不知则坦诚说明，禁止编造履历。",
    "",
    "===== 知识库 =====",
    XIAOCOO_KNOWLEDGE,
    "===== 知识库结束 =====",
  ].join("\n");
}

export function sanitizeMessages(
  input: unknown
): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(input)) return [];
  const out: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CONTENT_CHARS);
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
    if (out.length >= MAX_MESSAGES) break;
  }
  return out;
}

export function buildChatMessages(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  language: "zh" | "en"
): LlmMessage[] {
  return [{ role: "system", content: buildSystemPrompt(language) }, ...history];
}

export type DeepSeekEnv = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function resolveDeepSeekEnv(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): DeepSeekEnv | null {
  const apiKey = env.DEEPSEEK_API_KEY?.trim() || env.XIAOCOO_LLM_API_KEY?.trim();
  if (!apiKey) return null;
  const baseUrl = (
    env.DEEPSEEK_BASE_URL?.trim() ||
    env.XIAOCOO_LLM_BASE_URL?.trim() ||
    "https://api.deepseek.com"
  ).replace(/\/$/, "");
  const model =
    env.DEEPSEEK_MODEL?.trim() ||
    env.XIAOCOO_LLM_MODEL?.trim() ||
    "deepseek-v4-flash";
  return { apiKey, baseUrl, model };
}

export async function forwardDeepSeekStream(
  messages: LlmMessage[],
  llm: DeepSeekEnv
): Promise<Response> {
  return fetch(`${llm.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llm.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: llm.model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
      temperature: 0.7,
    }),
  });
}
