"use client";

import { use, useEffect, useState } from "react";
import { useLatest } from "@/lib/api";
import InstallHint from "@/components/InstallHint";
import NotificationToggle from "@/components/NotificationToggle";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ViewPage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = use(params);
  const { latest, isLoading } = useLatest(spaceId, 5000);
  const [, setTick] = useState(0);

  useEffect(() => {
    const ticker = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(ticker);
  }, []);

  return (
    <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Latest</h1>
      </header>

      <InstallHint />
      <NotificationToggle spaceId={spaceId} />

      {isLoading && !latest ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading…</div>
      ) : !latest ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
          No emotions logged yet.
        </div>
      ) : (
        <div
          className="rounded-3xl p-8 flex flex-col gap-6 items-center text-center shadow-lg"
          style={{
            background: latest.emotionSnapshot.color + "33",
            borderTop: `8px solid ${latest.emotionSnapshot.color}`,
          }}
        >
          <div className="text-7xl">{latest.emotionSnapshot.emoji}</div>
          <div className="text-2xl font-semibold">{latest.emotionSnapshot.name}</div>
          <div className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed flex items-center gap-2 justify-center">
            <span>{latest.actionSnapshot.emoji}</span>
            <span>{latest.actionSnapshot.label}</span>
          </div>
          {latest.why && (
            <div className="text-sm text-gray-600 dark:text-gray-400 italic border-t border-gray-300/50 pt-4 w-full">
              &ldquo;{latest.why}&rdquo;
            </div>
          )}
          <div className="text-xs text-gray-500">{timeAgo(latest.createdAt)}</div>
        </div>
      )}
    </main>
  );
}
