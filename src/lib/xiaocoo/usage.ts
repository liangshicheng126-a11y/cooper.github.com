/** DeepSeek usage pricing + daily quota helpers (shared by Next API). */

import type { Language } from "@/locales/config";
import { chatErrorMessage } from "./localization";

export const DAILY_BUDGET_CNY = 1;
/** Approximate USD→CNY for quota accounting (DeepSeek bills in USD). */
export const USD_CNY_RATE = 7.2;

export type TokenUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
};

/** Per-1M-token USD rates (deepseek-v4-flash / legacy deepseek-chat mapping). */
const FLASH_PRICES = {
  cacheHit: 0.0028,
  cacheMiss: 0.14,
  output: 0.28,
};

export function estimateCostCny(usage: TokenUsage | null | undefined): number {
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

/** Fallback when stream usage chunk is missing (~chars heuristic). */
export function estimateCostCnyFromText(inputChars: number, outputChars: number): number {
  const promptTokens = Math.ceil(inputChars / 2);
  const completionTokens = Math.ceil(outputChars / 2);
  return estimateCostCny({
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    prompt_cache_miss_tokens: promptTokens,
    prompt_cache_hit_tokens: 0,
  });
}

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function quotaExceededMessage(language: Language): string {
  return chatErrorMessage(language, "QUOTA_EXCEEDED");
}

export function buildQuotaKey(visitorName: string, deviceId: string): string {
  const name = visitorName.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 40);
  const device = deviceId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "unknown";
  return `${utcDateKey()}:${name}:${device}`;
}
