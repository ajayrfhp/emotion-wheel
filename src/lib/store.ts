"use client";

import { useSyncExternalStore } from "react";

export type LogEntry = {
  id: string;
  emotionSnapshot: { name: string; color: string; emoji?: string };
  actionSnapshot: { label: string; emoji?: string };
  why?: string;
  createdAt: number;
};

export function generateSpaceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 22);
}

// --- "Last opened space" memory, kept in localStorage on each device.

const LAST_KEY = "ew:lastSpace";

export function useLastSpaceId(): string | null {
  return useSyncExternalStore(
    (cb) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === LAST_KEY) cb();
      };
      const onLocal = () => cb();
      window.addEventListener("storage", onStorage);
      window.addEventListener("ew:lastSpace-updated", onLocal);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("ew:lastSpace-updated", onLocal);
      };
    },
    () => (typeof window === "undefined" ? null : localStorage.getItem(LAST_KEY)),
    () => null,
  );
}

export function setLastSpaceId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(LAST_KEY, id);
  else localStorage.removeItem(LAST_KEY);
  window.dispatchEvent(new CustomEvent("ew:lastSpace-updated"));
}
