"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/locales/LanguageProvider";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { shouldUseGsap } from "@/lib/motion";
import {
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
const MAX_NAME_LEN = 40;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(VISITOR_NAME_KEY)?.trim();
      if (saved) {
        setVisitorName(saved.slice(0, MAX_NAME_LEN));
        setNameDraft(saved.slice(0, MAX_NAME_LEN));
      }
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (visitorName) return;
    nameInputRef.current?.focus();
  }, [visitorName, mounted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: useMotion ? "smooth" : "auto" });
  }, [messages, streaming, useMotion]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!mounted) return null;

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

    const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await streamXiaocooChat(history, {
        signal: controller.signal,
        language,
        visitorName,
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

  if (!visitorName) {
    return (
      <div className="flex flex-col gap-6 w-full min-w-0 flex-1">
        <div
          className={cn(
            "glass rounded-[1.75rem] sm:rounded-[2rem] border-white/15",
            "p-6 sm:p-8 max-w-lg"
          )}
        >
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            {t.xiaocoo.gateTitle}
          </h2>
          <p className="text-foreground/60 leading-relaxed mb-6 text-[15px]">
            {t.xiaocoo.gateHint}
          </p>
          <form onSubmit={commitName} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
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
                  "w-full rounded-2xl px-4 py-3 text-[15px]",
                  "bg-white/60 dark:bg-white/5 border border-white/25",
                  "outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20",
                  "placeholder:text-foreground/35"
                )}
              />
            </label>
            <button
              type="submit"
              disabled={!nameDraft.trim()}
              className={cn(
                "w-full sm:w-auto px-6 h-12 rounded-2xl font-medium",
                "bg-indigo-500 text-white hover:bg-indigo-600 transition-colors",
                "disabled:opacity-40 disabled:pointer-events-none"
              )}
            >
              {t.xiaocoo.gateContinue}
            </button>
          </form>
        </div>
        <p className="text-xs text-foreground/40 px-1 leading-relaxed max-w-lg">
          {t.xiaocoo.privacyNote}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 flex-1">
      <p className="text-sm text-foreground/50 px-1">
        {t.xiaocoo.chattingAs}
        <span className="ml-2 font-medium text-indigo-500">{visitorName}</span>
      </p>

      <div
        className={cn(
          "glass rounded-[1.75rem] sm:rounded-[2rem] border-white/15",
          "flex flex-col min-h-[min(70vh,640px)] max-h-[min(78vh,720px)] overflow-hidden"
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-foreground/75 leading-relaxed text-[15px] sm:text-base">
                {t.xiaocoo.welcome}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-foreground/40 font-bold">
                {t.xiaocoo.emptyHint}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.xiaocoo.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={streaming}
                    onClick={() => void send(suggestion)}
                    className={cn(
                      "text-left text-sm px-3.5 py-2 rounded-2xl",
                      "border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
                      "hover:bg-indigo-500/15 hover:border-indigo-500/35 transition-colors",
                      "disabled:opacity-50"
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={useMotion ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-indigo-500/90 text-white rounded-br-md"
                    : "bg-white/50 dark:bg-white/10 border border-white/20 text-foreground rounded-bl-md"
                )}
              >
                {message.content ||
                  (streaming ? (
                    <span className="inline-flex items-center gap-2 text-foreground/50">
                      <Loader2 className="size-4 animate-spin" />
                      {t.xiaocoo.thinking}
                    </span>
                  ) : null)}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="border-t border-white/10 p-3 sm:p-4 flex items-end gap-2 sm:gap-3 bg-white/20 dark:bg-black/10"
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
                "w-full resize-none rounded-2xl px-4 py-3 text-[15px]",
                "bg-white/60 dark:bg-white/5 border border-white/25",
                "outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20",
                "placeholder:text-foreground/35 disabled:opacity-60"
              )}
            />
          </label>
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className={cn(
              "shrink-0 h-12 w-12 rounded-2xl inline-flex items-center justify-center",
              "bg-indigo-500 text-white hover:bg-indigo-600 transition-colors",
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
        <p className="text-sm text-rose-500/90 px-1" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-foreground/40 px-1 leading-relaxed">
        {t.xiaocoo.privacyNote}
      </p>
    </div>
  );
}
