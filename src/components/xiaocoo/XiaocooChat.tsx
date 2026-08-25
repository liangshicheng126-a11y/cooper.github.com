"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { motion, type Transition } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/locales/LanguageProvider";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { shouldUseGsap } from "@/lib/motion";
import { findCannedReply } from "@/lib/xiaocoo/cannedReplies";
import {
  getOrCreateDeviceId,
  readOpenAiSseStream,
  streamXiaocooChat,
  type ChatMessage,
} from "@/lib/xiaocoo/client";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const VISITOR_NAME_KEY = "xiaocoo-visitor-name";
const MESSAGES_KEY = "xiaocoo-chat-messages";
const MAX_NAME_LEN = 40;
const MAX_STORED_MESSAGES = 40;
const CANNED_THINK_MS = 800;
const CANNED_THINK_REDUCED_MS = 300;
/** Mobile keeps only these three prompts (zh/en), in this order. */
const MOBILE_SUGGESTION_MATCHERS = [
  /一分钟介绍|Introduce yourself in one minute/i,
  /目前在哪里|Where are you now/i,
  /未来的规划|future plans/i,
] as const;

function pickMobileSuggestions(all: string[]) {
  return MOBILE_SUGGESTION_MATCHERS.map((re) => all.find((s) => re.test(s))).filter(
    (s): s is string => Boolean(s)
  );
}

const BUBBLE_TRANSITION: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function loadStoredMessages(): UiMessage[] {
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: UiMessage[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      const id = (item as { id?: unknown }).id;
      if (role !== "user" && role !== "assistant") continue;
      if (typeof content !== "string" || !content.trim()) continue;
      out.push({
        id: typeof id === "string" ? id : uid(),
        role,
        content,
      });
      if (out.length >= MAX_STORED_MESSAGES) break;
    }
    return out;
  } catch {
    return [];
  }
}

function persistMessages(messages: UiMessage[]) {
  try {
    const slim = messages
      .filter((m) => m.content.trim())
      .slice(-MAX_STORED_MESSAGES)
      .map(({ id, role, content }) => ({ id, role, content }));
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(slim));
  } catch {
    /* private mode / quota */
  }
}

function bubbleMotion(role: "user" | "assistant", enabled: boolean) {
  if (!enabled) {
    return {
      initial: false as const,
      animate: { opacity: 1 },
      transition: { duration: 0 },
      style: undefined as CSSProperties | undefined,
    };
  }
  const isUser = role === "user";
  return {
    initial: {
      opacity: 0,
      scale: 0.98,
      x: isUser ? 8 : -8,
      y: 8,
    },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    transition: BUBBLE_TRANSITION,
    style: {
      transformOrigin: isUser ? "bottom right" : "bottom left",
    } as CSSProperties,
  };
}

export default function XiaocooChat() {
  const { t, language, mounted } = useTranslation();
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const useMotion = shouldUseGsap(reduced) && tier !== "minimal";

  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const deviceIdRef = useRef<string>("anonymous");
  const useMotionRef = useRef(useMotion);
  useMotionRef.current = useMotion;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(VISITOR_NAME_KEY)?.trim();
      if (saved) {
        setVisitorName(saved.slice(0, MAX_NAME_LEN));
        setNameDraft(saved.slice(0, MAX_NAME_LEN));
      }
      setMessages(loadStoredMessages());
      deviceIdRef.current = getOrCreateDeviceId();
    } catch {
      /* private mode */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    if (visitorName) return;
    nameInputRef.current?.focus();
  }, [visitorName, mounted]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;
    transcript.scrollTo({
      top: transcript.scrollHeight,
      behavior: useMotion ? "smooth" : "auto",
    });
  }, [messages, streaming, useMotion]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!mounted || !hydrated) return null;

  const commitName = (event: FormEvent) => {
    event.preventDefault();
    const name = nameDraft.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LEN);
    if (!name) return;
    setVisitorName(name);
    try {
      sessionStorage.setItem(VISITOR_NAME_KEY, name);
    } catch {
      /* ignore */
    }
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming || !visitorName) return;

    setError(null);
    setInput("");

    const userMsg: UiMessage = { id: uid(), role: "user", content };
    const assistantId = uid();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const canned = findCannedReply(content);
    if (canned) {
      try {
        const delay = useMotionRef.current ? CANNED_THINK_MS : CANNED_THINK_REDUCED_MS;
        await sleep(delay, controller.signal);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: canned } : m))
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: canned } : m
          )
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
      return;
    }

    const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await streamXiaocooChat(history, {
        signal: controller.signal,
        language,
        visitorName,
        deviceId: deviceIdRef.current,
      });

      if (!response.ok) {
        let detail = t.xiaocoo.error;
        try {
          const json = (await response.json()) as { error?: string };
          if (json.error) detail = json.error;
        } catch {
          /* keep default */
        }
        throw new Error(detail);
      }

      let assembled = "";
      for await (const delta of readOpenAiSseStream(response)) {
        assembled += delta;
        const snapshot = assembled;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m))
        );
      }

      if (!assembled.trim()) {
        throw new Error(t.xiaocoo.error);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error && err.message ? err.message : t.xiaocoo.error;
      setError(message);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content.trim() || t.xiaocoo.error }
            : m
        )
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const suggestions = isMobile
    ? pickMobileSuggestions(t.xiaocoo.suggestions)
    : t.xiaocoo.suggestions;

  if (!visitorName) {
    return (
      <div className="flex flex-col gap-6 w-full min-w-0 flex-1">
        <div
          className={cn(
            "xiaocoo-gate",
            "p-6 sm:p-8 max-w-lg"
          )}
        >
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            {t.xiaocoo.gateTitle}
          </h2>
          <p className="mb-6 text-[15px] leading-relaxed text-foreground/80">
            {t.xiaocoo.gateHint}
          </p>
          <form onSubmit={commitName} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/70">
                {t.xiaocoo.gateNameLabel}
              </span>
              <input
                ref={nameInputRef}
                type="text"
                required
                maxLength={MAX_NAME_LEN}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={t.xiaocoo.gateNamePlaceholder}
                className={cn(
                  "xiaocoo-field w-full rounded-xl px-4 py-3 text-[15px]",
                  "border",
                  "outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20",
                  "placeholder:text-foreground/60"
                )}
              />
            </label>
            <button
              type="submit"
              disabled={!nameDraft.trim()}
              className={cn(
                "w-full sm:w-auto px-6 h-12 rounded-xl font-medium",
                "bg-white text-slate-950 hover:bg-zinc-200 transition-colors",
                "disabled:opacity-40 disabled:pointer-events-none"
              )}
            >
              {t.xiaocoo.gateContinue}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 flex-1">
      <p className="xiaocoo-identity px-1 text-sm font-medium text-foreground/75">
        {t.xiaocoo.chattingAs}
        <span className="ml-2 font-semibold text-indigo-700 dark:text-indigo-300">
          {visitorName}
        </span>
      </p>

      <div
        className={cn(
          "xiaocoo-chat",
          "flex flex-col min-h-[min(70vh,640px)] max-h-[min(78vh,720px)] overflow-hidden"
        )}
      >
        <div ref={transcriptRef} className="xiaocoo-chat__transcript flex-1 overflow-y-auto px-4 sm:px-7 py-5 sm:py-7 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-[15px] font-medium leading-relaxed text-foreground/90 sm:text-base">
                {t.xiaocoo.welcome}
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/65">
                {t.xiaocoo.emptyHint}
              </p>
            </div>
          )}

          {messages.map((message) => {
            const motionProps = bubbleMotion(message.role, useMotion);
            const showThinking =
              message.role === "assistant" && !message.content.trim() && streaming;
            return (
              <motion.div
                key={message.id}
                initial={motionProps.initial}
                animate={motionProps.animate}
                transition={motionProps.transition}
                style={motionProps.style}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] sm:max-w-[78%] rounded-2xl px-3.5 sm:px-4 py-3 text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "xiaocoo-message xiaocoo-message--user text-white rounded-br-md"
                      : "xiaocoo-message xiaocoo-message--assistant rounded-bl-md border text-foreground"
                  )}
                >
                  {showThinking ? (
                    <span className="inline-flex items-center gap-2 text-foreground/70">
                      <Loader2 className="size-4 animate-spin" />
                      {t.xiaocoo.thinking}
                    </span>
                  ) : (
                    message.content
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="xiaocoo-suggestions px-3 pt-3 pb-1 sm:px-5">
          {messages.length > 0 && (
            <p className="mb-2 px-0.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-200">
              {t.xiaocoo.suggestionsHint}
            </p>
          )}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 max-h-[28vh] overflow-y-auto pb-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={streaming}
                onClick={() => void send(suggestion)}
                className={cn(
                  "xiaocoo-suggestion min-h-11 text-left text-[13px] sm:min-h-0 sm:text-sm px-3.5 py-2.5 sm:py-2 rounded-xl",
                  "border text-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2",
                  "disabled:opacity-50 w-full sm:w-auto"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="xiaocoo-composer flex items-end gap-2 border-t p-3 sm:gap-3 sm:p-4"
        >
          <label className="flex-1 min-w-0">
            <span className="sr-only">{t.xiaocoo.placeholder}</span>
            <textarea
              rows={1}
              value={input}
              disabled={streaming}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={t.xiaocoo.placeholder}
              className={cn(
                "xiaocoo-field w-full resize-none rounded-xl px-4 py-3 text-[15px]",
                "border text-foreground",
                "outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/30",
                "placeholder:text-foreground/70 dark:placeholder:text-indigo-100/75 disabled:opacity-60"
              )}
            />
          </label>
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className={cn(
              "xiaocoo-send shrink-0 h-12 w-12 rounded-xl inline-flex items-center justify-center",
              "text-white transition-colors",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
            aria-label={t.xiaocoo.send}
          >
            {streaming ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </form>
      </div>

      {error && (
        <p className="text-sm text-rose-500/90 px-1 whitespace-pre-wrap" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
