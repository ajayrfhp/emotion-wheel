"use client";

import { useState } from "react";
import { Emotion, Action, DEFAULT_EMOTIONS, DEFAULT_EMOTIONS_48, DEFAULT_ACTIONS, NO_ACTION_ID } from "@/lib/emotions";
import { saveConfig } from "@/lib/api";

type Props = {
  spaceId: string;
  initialEmotions: Emotion[];
  initialActions: Action[];
  onSaved?: () => void;
};

export default function SettingsEditor({ spaceId, initialEmotions, initialActions, onSaved }: Props) {
  const [emotions, setEmotions] = useState<Emotion[]>(initialEmotions);
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Emotions
  const updateE = (i: number, patch: Partial<Emotion>) =>
    setEmotions((p) => p.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const removeE = (i: number) => setEmotions((p) => p.filter((_, idx) => idx !== i));
  const addE = () =>
    setEmotions((p) => [
      ...p,
      { id: `e_${Date.now()}`, name: "New", color: "#cccccc", emoji: "🙂", defaultActionId: NO_ACTION_ID },
    ]);
  const moveE = (i: number, dir: -1 | 1) =>
    setEmotions((p) => {
      const next = [...p];
      const j = i + dir;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // ---- Actions
  const updateA = (i: number, patch: Partial<Action>) =>
    setActions((p) => p.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  const removeA = (i: number) => {
    const removed = actions[i];
    if (removed.id === NO_ACTION_ID) return;
    setActions((p) => p.filter((_, idx) => idx !== i));
    // Re-point any emotion whose default referenced this action.
    setEmotions((p) =>
      p.map((e) => (e.defaultActionId === removed.id ? { ...e, defaultActionId: NO_ACTION_ID } : e)),
    );
  };
  const addA = () =>
    setActions((p) => [...p, { id: `a_${Date.now()}`, label: "New action", emoji: "✨" }]);
  const moveA = (i: number, dir: -1 | 1) =>
    setActions((p) => {
      const next = [...p];
      const j = i + dir;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveConfig(spaceId, { emotions, actions });
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (confirm("Reset wheel and actions to defaults?")) {
      setEmotions(DEFAULT_EMOTIONS);
      setActions(DEFAULT_ACTIONS);
    }
  };

  const useDetailed = () => {
    if (confirm("Switch to the detailed 48-emotion wheel? Your action list is preserved.")) {
      setEmotions(DEFAULT_EMOTIONS_48);
    }
  };

  const useSimple = () => {
    if (confirm("Switch to the simple 8-emotion wheel?")) {
      setEmotions(DEFAULT_EMOTIONS);
    }
  };

  const isDetailed = emotions.some((e) => e.children && e.children.length > 0);

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Emotions</h2>
          <button
            onClick={isDetailed ? useSimple : useDetailed}
            className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900"
          >
            {isDetailed ? "Use simple 8 wheel" : "Use detailed 48 wheel"}
          </button>
        </div>
        {isDetailed && (
          <p className="text-xs text-gray-500 -mt-1">
            Detailed wheel — 6 cores × 8 sub-emotions. Editing below changes the cores; sub-emotions stay as defaults.
          </p>
        )}
        {emotions.map((e, i) => (
          <div
            key={e.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={e.color}
                onChange={(ev) => updateE(i, { color: ev.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                value={e.emoji ?? ""}
                onChange={(ev) => updateE(i, { emoji: ev.target.value })}
                className="w-12 text-center text-xl border border-gray-200 dark:border-gray-700 rounded bg-transparent"
                maxLength={4}
              />
              <input
                value={e.name}
                onChange={(ev) => updateE(i, { name: ev.target.value })}
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-transparent"
              />
            </div>
            <label className="text-xs text-gray-500 flex flex-col gap-1">
              Default action (pre-selected when logging)
              <select
                value={e.defaultActionId}
                onChange={(ev) => updateE(i, { defaultActionId: ev.target.value })}
                className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 bg-transparent text-sm text-gray-900 dark:text-gray-100"
              >
                {actions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-1 justify-end text-xs">
              <button onClick={() => moveE(i, -1)} disabled={i === 0} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">↑</button>
              <button onClick={() => moveE(i, 1)} disabled={i === emotions.length - 1} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">↓</button>
              <button onClick={() => removeE(i)} className="px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Delete</button>
            </div>
          </div>
        ))}
        <button
          onClick={addE}
          className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          + Add emotion
        </button>
      </section>

      <section className="flex flex-col gap-3 mt-4">
        <h2 className="text-lg font-semibold">Actions</h2>
        <p className="text-xs text-gray-500 -mt-1">What you might need from her. Shown as choices when logging.</p>
        {actions.map((a, i) => {
          const isNone = a.id === NO_ACTION_ID;
          return (
            <div
              key={a.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center gap-2"
            >
              <input
                value={a.emoji ?? ""}
                onChange={(ev) => updateA(i, { emoji: ev.target.value })}
                className="w-12 text-center text-xl border border-gray-200 dark:border-gray-700 rounded bg-transparent disabled:opacity-60"
                maxLength={4}
                disabled={isNone}
              />
              <input
                value={a.label}
                onChange={(ev) => updateA(i, { label: ev.target.value })}
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-transparent disabled:opacity-60"
                disabled={isNone}
              />
              <div className="flex gap-1 text-xs">
                <button onClick={() => moveA(i, -1)} disabled={i === 0 || isNone} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">↑</button>
                <button onClick={() => moveA(i, 1)} disabled={i === actions.length - 1 || isNone} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">↓</button>
                <button onClick={() => removeA(i)} disabled={isNone} className="px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-30">×</button>
              </div>
            </div>
          );
        })}
        <button
          onClick={addA}
          className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          + Add action
        </button>
      </section>

      <div className="flex gap-2 sticky bottom-2 mt-4 bg-[var(--background)] pt-2">
        <button
          onClick={reset}
          className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-3 rounded-lg text-sm"
        >
          Reset
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {error && <div className="text-xs text-red-600 text-center -mt-2">{error}</div>}
    </>
  );
}
