"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = "unsupported" | "blocked" | "off" | "on" | "loading";

export default function NotificationToggle({ spaceId }: { spaceId: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await detectStatus();
      if (cancelled) return;
      setStatus(next);
      if (next === "on") {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const sub = await reg?.pushManager.getSubscription();
          if (sub) {
            await fetch(`/api/spaces/${spaceId}/subscriptions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(sub.toJSON()),
            });
          }
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [spaceId]);

  async function detectStatus(): Promise<Status> {
    if (typeof window === "undefined") return "loading";
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      return "unsupported";
    }
    if (Notification.permission === "denied") return "blocked";
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return "off";
    const sub = await reg.pushManager.getSubscription();
    return sub ? "on" : "off";
  }

  async function enable() {
    setError(null);
    setStatus("loading");
    try {
      if (!VAPID_PUBLIC_KEY) throw new Error("VAPID public key not configured");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "blocked" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      await fetch(`/api/spaces/${spaceId}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      setStatus("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enable notifications");
      setStatus(await detectStatus());
    }
  }

  async function disable() {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch(`/api/spaces/${spaceId}/subscriptions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disable");
      setStatus(await detectStatus());
    }
  }

  if (status === "loading") return null;
  if (status === "unsupported") {
    return (
      <div className="text-xs text-gray-500 text-center mb-3">
        Notifications aren&apos;t supported on this browser.
      </div>
    );
  }
  if (status === "blocked") {
    return (
      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-800 dark:text-amber-200 mb-3">
        Notifications are blocked. Enable them in your browser site settings, then reload.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 mb-3 px-1">
      <span className="text-xs text-gray-500">
        {status === "on" ? "🔔 Notifications on" : "🔕 Notifications off"}
      </span>
      {status === "on" ? (
        <button
          onClick={disable}
          className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Turn off
        </button>
      ) : (
        <button
          onClick={enable}
          className="text-xs px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Enable notifications
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
