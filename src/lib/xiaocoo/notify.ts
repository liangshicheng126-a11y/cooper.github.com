export type NotifyMeta = {
  country?: string;
  language?: string;
  userAgent?: string;
};

export type NotifyConfig = {
  telegramBotToken?: string;
  telegramChatId?: string;
  /** Feishu / Lark custom bot webhook URL */
  feishuWebhookUrl?: string;
};

const MAX_NOTIFY_CHARS = 3500;

export function resolveNotifyConfig(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): NotifyConfig {
  return {
    telegramBotToken: env.TELEGRAM_BOT_TOKEN?.trim() || env.XIAOCOO_TELEGRAM_BOT_TOKEN?.trim(),
    telegramChatId: env.TELEGRAM_CHAT_ID?.trim() || env.XIAOCOO_TELEGRAM_CHAT_ID?.trim(),
    feishuWebhookUrl: env.FEISHU_WEBHOOK_URL?.trim() || env.XIAOCOO_FEISHU_WEBHOOK_URL?.trim(),
  };
}

export function hasNotifyChannel(config: NotifyConfig): boolean {
  const telegram = Boolean(config.telegramBotToken && config.telegramChatId);
  const feishu = Boolean(config.feishuWebhookUrl);
  return telegram || feishu;
}

export function formatXiaocooNotifyText(input: {
  userMessage: string;
  assistantMessage: string;
  meta?: NotifyMeta;
}): string {
  const time = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const country = input.meta?.country?.trim() || "unknown";
  const language = input.meta?.language?.trim() || "-";
  const ua = (input.meta?.userAgent ?? "").slice(0, 120) || "-";

  const body = [
    "小coo 新对话",
    `时间: ${time}`,
    `地区: ${country}`,
    `语言: ${language}`,
    `UA: ${ua}`,
    "",
    "访客:",
    input.userMessage.trim() || "(空)",
    "",
    "小coo:",
    input.assistantMessage.trim() || "(空回复)",
  ].join("\n");

  if (body.length <= MAX_NOTIFY_CHARS) return body;
  return `${body.slice(0, MAX_NOTIFY_CHARS - 20)}\n…(已截断)`;
}

export async function sendXiaocooNotify(
  config: NotifyConfig,
  text: string
): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (config.telegramBotToken && config.telegramChatId) {
    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    tasks.push(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text,
          disable_web_page_preview: true,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("[xiaocoo-notify] telegram failed", res.status, detail.slice(0, 200));
        }
      })
    );
  }

  if (config.feishuWebhookUrl) {
    tasks.push(
      fetch(config.feishuWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msg_type: "text",
          content: { text },
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("[xiaocoo-notify] feishu failed", res.status, detail.slice(0, 200));
        }
      })
    );
  }

  if (tasks.length === 0) return;
  await Promise.allSettled(tasks);
}

/** Parse OpenAI SSE chunks and accumulate assistant text; pass-through bytes to the client. */
export function teeOpenAiSseStream(
  upstream: ReadableStream<Uint8Array>,
  onComplete: (assistantText: string) => void | Promise<void>
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";
  let assistant = "";

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
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) assistant += delta;
            } catch {
              /* ignore partial JSON */
            }
          }
        }
        controller.close();
        try {
          await onComplete(assistant);
        } catch (err) {
          console.error("[xiaocoo-notify] onComplete failed", err);
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
