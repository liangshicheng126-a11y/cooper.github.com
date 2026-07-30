import { XIAOCOO_KNOWLEDGE } from "./knowledge";

export interface Env {
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  FEISHU_WEBHOOK_URL?: string;
}

type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

type ChatTurn = { role: "user" | "assistant"; content: string };

type TokenUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;
const MAX_MESSAGES = 24;
const MAX_CONTENT_CHARS = 4000;
const MAX_NOTIFY_CHARS = 3500;
const MAX_VISITOR_NAME = 40;
const MAX_DEVICE_ID = 64;
const DAILY_BUDGET_CNY = 1;
const USD_CNY_RATE = 7.2;
const FLASH_PRICES = { cacheHit: 0.0028, cacheMiss: 0.14, output: 0.28 };

const rateLog = new Map<string, number[]>();
/** Fallback when Cache API is unavailable in an isolate. */
const memoryQuota = new Map<string, number>();

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

function sanitizeVisitorName(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_VISITOR_NAME);
}

function sanitizeDeviceId(input: unknown): string {
  if (typeof input !== "string") return "unknown";
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, MAX_DEVICE_ID);
  return cleaned || "unknown";
}

function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildQuotaKey(visitorName: string, deviceId: string): string {
  const name = visitorName.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 40);
  return `${utcDateKey()}:${name}:${deviceId}`;
}

function quotaExceededMessage(language: "zh" | "en"): string {
  if (language === "en") {
    return "Today's XiaoCoo chat quota for this device/name is used up (≈¥1/day). Please reach out directly: email liangshicheng303@126.com · WeChat llqsc1122.";
  }
  return "今天这台设备/该访客名的小coo 问答额度已用完（约 ¥1/天）。可通过其他渠道联系本人：邮箱 liangshicheng303@126.com · 微信 llqsc1122。";
}

function estimateCostCny(usage: TokenUsage | null | undefined): number {
  if (!usage) return 0;
  const hit = usage.prompt_cache_hit_tokens ?? 0;
  const miss =
    usage.prompt_cache_miss_tokens ??
    Math.max(0, (usage.prompt_tokens ?? 0) - hit);
  const out = usage.completion_tokens ?? 0;
  const usd =
    (hit / 1_000_000) * FLASH_PRICES.cacheHit +
    (miss / 1_000_000) * FLASH_PRICES.cacheMiss +
    (out / 1_000_000) * FLASH_PRICES.output;
  return usd * USD_CNY_RATE;
}

function estimateCostCnyFromText(inputChars: number, outputChars: number): number {
  const promptTokens = Math.ceil(inputChars / 2);
  const completionTokens = Math.ceil(outputChars / 2);
  return estimateCostCny({
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    prompt_cache_miss_tokens: promptTokens,
    prompt_cache_hit_tokens: 0,
  });
}

function quotaCacheUrl(key: string): string {
  return `https://xiaocoo-quota.internal/${encodeURIComponent(key)}`;
}

async function getQuotaCny(key: string): Promise<number> {
  try {
    const hit = await caches.default.match(quotaCacheUrl(key));
    if (hit) {
      const data = (await hit.json()) as { cny?: number };
      if (typeof data.cny === "number") return data.cny;
    }
  } catch {
    /* fall through */
  }
  return memoryQuota.get(key) ?? 0;
}

async function addQuotaCny(key: string, delta: number): Promise<number> {
  const next = (await getQuotaCny(key)) + Math.max(0, delta);
  memoryQuota.set(key, next);
  try {
    await caches.default.put(
      quotaCacheUrl(key),
      new Response(JSON.stringify({ cny: next }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=172800",
        },
      })
    );
  } catch {
    /* memory fallback only */
  }
  return next;
}

function hasNotifyChannel(env: Env): boolean {
  return Boolean(
    (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) || env.FEISHU_WEBHOOK_URL
  );
}

function formatNotifyText(input: {
  userMessage: string;
  assistantMessage: string;
  visitorName?: string;
  userAgent?: string;
}): string {
  const name = input.visitorName?.trim() || "未留名访客";
  const ua = (input.userAgent ?? "").trim().slice(0, 180) || "-";
  const body = [
    "小coo 新对话",
    `访客: ${name}`,
    `UA: ${ua}`,
    "",
    "问:",
    input.userMessage.trim() || "(空)",
    "",
    "答:",
    input.assistantMessage.trim() || "(空回复)",
  ].join("\n");

  if (body.length <= MAX_NOTIFY_CHARS) return body;
  return `${body.slice(0, MAX_NOTIFY_CHARS - 20)}\n…(已截断)`;
}

async function sendNotify(env: Env, text: string): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    tasks.push(
      fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          disable_web_page_preview: true,
        }),
      })
    );
  }

  if (env.FEISHU_WEBHOOK_URL) {
    tasks.push(
      fetch(env.FEISHU_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msg_type: "text",
          content: { text },
        }),
      })
    );
  }

  await Promise.allSettled(tasks);
}

function teeOpenAiSseStream(
  upstream: ReadableStream<Uint8Array>,
  onComplete: (assistantText: string, usage: TokenUsage | null) => void | Promise<void>
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";
  let assistant = "";
  let usage: TokenUsage | null = null;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
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
                choices?: Array<{ delta?: { content?: string } }>;
                usage?: TokenUsage | null;
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) assistant += delta;
              if (json.usage) usage = json.usage;
            } catch {
              /* ignore */
            }
          }
        }
        controller.close();
        await onComplete(assistant, usage);
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

    let body: {
      messages?: unknown;
      language?: unknown;
      visitorName?: unknown;
      deviceId?: unknown;
    };
    try {
      body = (await request.json()) as typeof body;
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

    const visitorName = sanitizeVisitorName(body.visitorName);
    if (!visitorName) {
      return Response.json({ error: "visitorName is required." }, { status: 400, headers });
    }

    const language = body.language === "en" ? "en" : "zh";
    const deviceId = sanitizeDeviceId(body.deviceId);
    const quotaKey = buildQuotaKey(visitorName, deviceId);
    if ((await getQuotaCny(quotaKey)) >= DAILY_BUDGET_CNY) {
      return Response.json(
        { error: quotaExceededMessage(language), code: "QUOTA_EXCEEDED" },
        { status: 429, headers }
      );
    }

    const baseUrl = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";
    const systemPrompt = buildSystemPrompt(language);
    const promptChars =
      systemPrompt.length + history.reduce((n, m) => n + m.content.length, 0);

    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0.7,
        messages: [{ role: "system", content: systemPrompt }, ...history],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return Response.json(
        { error: "Upstream model error.", detail: detail.slice(0, 500) },
        { status: 502, headers }
      );
    }

    const userMessage = history[history.length - 1]?.content ?? "";
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const stream = teeOpenAiSseStream(upstream.body, (assistantMessage, usage) => {
      const cost =
        estimateCostCny(usage) ||
        estimateCostCnyFromText(promptChars, assistantMessage.length);
      const tasks: Promise<unknown>[] = [addQuotaCny(quotaKey, cost)];
      if (hasNotifyChannel(env)) {
        tasks.push(
          sendNotify(
            env,
            formatNotifyText({
              userMessage,
              assistantMessage,
              visitorName,
              userAgent,
            })
          )
        );
      }
      const p = Promise.allSettled(tasks);
      ctx.waitUntil(p);
      return p;
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  },
};
