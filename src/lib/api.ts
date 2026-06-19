"use client";

import useSWR from "swr";
import { Emotion, Action, DEFAULT_EMOTIONS, DEFAULT_ACTIONS } from "./emotions";
import type { LogEntry } from "./store";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);
  return res.json();
};

export type SpaceConfig = { emotions: Emotion[]; actions: Action[] };

export function useSpaceConfig(spaceId: string) {
  const { data, error, isLoading, mutate } = useSWR<SpaceConfig>(
    spaceId ? `/api/spaces/${spaceId}` : null,
    fetcher,
  );
  return {
    emotions: data?.emotions ?? DEFAULT_EMOTIONS,
    actions: data?.actions ?? DEFAULT_ACTIONS,
    isLoading,
    error,
    mutate,
  };
}

export function useLatest(spaceId: string, refreshInterval = 5000) {
  const { data, error, isLoading, mutate } = useSWR<{ latest: LogEntry | null }>(
    spaceId ? `/api/spaces/${spaceId}/latest` : null,
    fetcher,
    {
      refreshInterval,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    },
  );
  return { latest: data?.latest ?? null, isLoading, error, mutate };
}

export async function saveConfig(spaceId: string, config: SpaceConfig) {
  const res = await fetch(`/api/spaces/${spaceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(`Save config failed: ${res.status}`);
  return (await res.json()) as SpaceConfig;
}

export async function postLog(
  spaceId: string,
  payload: {
    emotionSnapshot: LogEntry["emotionSnapshot"];
    actionSnapshot: LogEntry["actionSnapshot"];
    why?: string;
  },
) {
  const res = await fetch(`/api/spaces/${spaceId}/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Post log failed: ${res.status}`);
  return (await res.json()) as { latest: LogEntry };
}
