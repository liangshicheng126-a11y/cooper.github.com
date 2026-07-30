import { NextResponse } from "next/server";
import {
  buildChatMessages,
  forwardDeepSeekStream,
  resolveDeepSeekEnv,
  sanitizeMessages,
} from "@/lib/xiaocoo/server";
import {
  formatXiaocooNotifyText,
  hasNotifyChannel,
  resolveNotifyConfig,
  sanitizeVisitorName,
  sendXiaocooNotify,
  teeOpenAiSseStream,
} from "@/lib/xiaocoo/notify";
import { addQuotaCny, isQuotaExceeded } from "@/lib/xiaocoo/quotaStore";
import {
  buildQuotaKey,
  estimateCostCny,
  estimateCostCnyFromText,
  quotaExceededMessage,
} from "@/lib/xiaocoo/usage";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 12;
const MAX_DEVICE_ID = 64;
const ipRequestLog = new Map<string, number[]>();

type Body = {
  messages?: unknown;
  language?: unknown;
  visitorName?: unknown;
  deviceId?: unknown;
};

function sanitizeDeviceId(input: unknown): string {
  if (typeof input !== "string") return "unknown";
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, MAX_DEVICE_ID);
  return cleaned || "unknown";
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://cooperliang.top",
    "https://www.cooperliang.top",
  ]);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) allowed.add(site);

  const allowOrigin = origin && allowed.has(origin) ? origin : "https://cooperliang.top";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    const llm = resolveDeepSeekEnv();
    if (!llm) {
      return NextResponse.json(
        { error: "XiaoCoo API is not configured (missing DEEPSEEK_API_KEY)." },
        { status: 503, headers }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const recent = (ipRequestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Too many requests. Please wait and retry." },
        { status: 429, headers }
      );
    }
    recent.push(now);
    ipRequestLog.set(ip, recent);

    const body = (await request.json()) as Body;
    const history = sanitizeMessages(body.messages);
    if (history.length === 0 || history[history.length - 1]?.role !== "user") {
      return NextResponse.json(
        { error: "Expected a non-empty messages array ending with a user turn." },
        { status: 400, headers }
      );
    }

    const visitorName = sanitizeVisitorName(body.visitorName);
    if (!visitorName) {
      return NextResponse.json(
        { error: "visitorName is required." },
        { status: 400, headers }
      );
    }

    const language = body.language === "en" ? "en" : "zh";
    const deviceId = sanitizeDeviceId(body.deviceId);
    const quotaKey = buildQuotaKey(visitorName, deviceId);
    if (isQuotaExceeded(quotaKey)) {
      return NextResponse.json(
        { error: quotaExceededMessage(language), code: "QUOTA_EXCEEDED" },
        { status: 429, headers }
      );
    }

    const messages = buildChatMessages(history, language);
    const upstream = await forwardDeepSeekStream(messages, llm);

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: "Upstream model error.", detail: detail.slice(0, 500) },
        { status: 502, headers }
      );
    }

    const userMessage = history[history.length - 1]?.content ?? "";
    const promptChars = messages.reduce((n, m) => n + m.content.length, 0);
    const notifyConfig = resolveNotifyConfig();

    const stream = teeOpenAiSseStream(upstream.body, async (assistantMessage, usage) => {
      const cost =
        estimateCostCny(usage) ||
        estimateCostCnyFromText(promptChars, assistantMessage.length);
      addQuotaCny(quotaKey, cost);

      if (hasNotifyChannel(notifyConfig)) {
        const text = formatXiaocooNotifyText({
          userMessage,
          assistantMessage,
          meta: {
            visitorName,
            userAgent: request.headers.get("user-agent") ?? undefined,
          },
        });
        await sendXiaocooNotify(notifyConfig, text);
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500, headers }
    );
  }
}
