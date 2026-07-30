/** In-memory daily quota store (Next.js API / local dev). */

import { DAILY_BUDGET_CNY } from "./usage";

type Entry = { cny: number; updatedAt: number };

const store = new Map<string, Entry>();
const DAY_MS = 86_400_000;

function prune(now: number) {
  if (store.size < 500) return;
  for (const [k, v] of store) {
    if (now - v.updatedAt > DAY_MS) store.delete(k);
  }
}

export function getQuotaCny(key: string): number {
  return store.get(key)?.cny ?? 0;
}

export function addQuotaCny(key: string, delta: number): number {
  const now = Date.now();
  prune(now);
  const next = (store.get(key)?.cny ?? 0) + Math.max(0, delta);
  store.set(key, { cny: next, updatedAt: now });
  return next;
}

export function isQuotaExceeded(key: string): boolean {
  return getQuotaCny(key) >= DAILY_BUDGET_CNY;
}
