import { XIAOCOO_KNOWLEDGE } from "./knowledge";

export interface Env {
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  ALLOWED_ORIGINS?: string;
}

type ChatTurn = { role: "user" | "assistant"; content: string };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;
const MAX_MESSAGES = 24;
const MAX_CONTENT_CHARS = 4000;

const rateLog = new Map<string, number[]>();

const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://cooperliang.top",
  "https://www.cooperliang.top",
];

function allowedOrigins(env: Env): Set<string> {
  const extra = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...extra]);
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowed = allowedOrigins(env);
  const allowOrigin = origin && allowed.has(origin) ? origin : "https://cooperliang.top";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function buildSystemPrompt(language: "zh" | "en"): string {
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

function sanitizeMessages(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return [];
  const out: ChatTurn[] = [];
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

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLog.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateLog.set(ip, recent);
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin");
    const headers = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405, headers });
    }

    if (!env.DEEPSEEK_API_KEY) {
      return Response.json(
        { error: "XiaoCoo API is not configured (missing DEEPSEEK_API_KEY)." },
        { status: 503, headers }
      );
    }

    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Too many requests. Please wait and retry." },
        { status: 429, headers }
      );
    }

    let body: { messages?: unknown; language?: unknown };
    try {
      body = (await request.json()) as { messages?: unknown; language?: unknown };
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400, headers });
    }

    const history = sanitizeMessages(body.messages);
    if (history.length === 0 || history[history.length - 1]?.role !== "user") {
      return Response.json(
        { error: "Expected a non-empty messages array ending with a user turn." },
        { status: 400, headers }
      );
    }

    const language = body.language === "en" ? "en" : "zh";
    const baseUrl = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const model = env.DEEPSEEK_MODEL || "deepseek-chat";

    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        messages: [{ role: "system", content: buildSystemPrompt(language) }, ...history],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return Response.json(
        { error: "Upstream model error.", detail: detail.slice(0, 500) },
        { status: 502, headers }
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  },
};
