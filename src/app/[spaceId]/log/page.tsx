"use client";

import { use, useState } from "react";
import Link from "next/link";
import EmotionWheel from "@/components/EmotionWheel";
import { Emotion, RESET_EMOTION, NO_ACTION_ID, NO_ACTION } from "@/lib/emotions";
import { useSpaceConfig, postLog } from "@/lib/api";

export default function LogPage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = use(params);
  const { emotions, actions, isLoading } = useSpaceConfig(spaceId);
  const [pending, setPending] = useState<Emotion | null>(null);
  const [actionId, setActionId] = useState<string>(NO_ACTION_ID);
  const [why, setWhy] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const openModal = (e: Emotion) => {
    setPending(e);
    const fallback = actions.find((a) => a.id === e.defaultActionId)?.id ?? NO_ACTION_ID;
    setActionId(fallback);
    setWhy("");
  };

  const close = () => {
    setPending(null);
    setWhy("");
  };

  const send = async () => {
    if (!pending) return;
    const action = actions.find((a) => a.id === actionId) ?? NO_ACTION;
    setSending(true);
    try {
      await postLog(spaceId, {
        emotionSnapshot: { name: pending.name, color: pending.color, emoji: pending.emoji },
        actionSnapshot: { label: action.label, emoji: action.emoji },
        why: why.trim() || undefined,
      });
      close();
      setToast("Sent ✓");
      setTimeout(() => setToast(null), 1800);
    } catch (e) {
      setToast("Failed — try again");
      setTimeout(() => setToast(null), 2500);
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-4 gap-4 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">How are you feeling?</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/${spaceId}/view`} className="text-indigo-600 hover:underline">View</Link>
          <Link href={`/${spaceId}/settings`} className="text-indigo-600 hover:underline">Settings</Link>
        </div>
      </header>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Loading…</div>
      ) : (
        <EmotionWheel emotions={emotions} onSelect={openModal} />
      )}

      <button
        onClick={() => openModal(RESET_EMOTION)}
        className="mt-2 self-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-full text-sm"
      >
        ✅ I&apos;m OK now
      </button>

      {pending && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={close}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-md flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                style={{ background: pending.color }}
              >
                {pending.emoji}
              </div>
              <div>
                <div className="font-semibold text-lg">{pending.name}</div>
                <div className="text-xs text-gray-500">Pick what you need from them</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {actions.map((a) => (
                <label
                  key={a.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    actionId === a.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="action"
                    value={a.id}
                    checked={actionId === a.id}
                    onChange={() => setActionId(a.id)}
                    className="sr-only"
                  />
                  <span className="text-xl w-7 text-center">{a.emoji}</span>
                  <span className="flex-1 text-sm">{a.label}</span>
                  {a.id === pending.defaultActionId && (
                    <span className="text-[10px] uppercase tracking-wide text-gray-500">default</span>
                  )}
                </label>
              ))}
            </div>

            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Why? (optional)"
              className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg p-3 text-sm resize-none"
              rows={2}
            />

            <div className="flex gap-2 justify-end sticky bottom-0 bg-white dark:bg-gray-900 pt-2">
              <button
                onClick={close}
                disabled={sending}
                className="px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={send}
                disabled={sending}
                className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full z-50">
          {toast}
        </div>
      )}
    </main>
  );
}
