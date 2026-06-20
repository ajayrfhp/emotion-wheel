"use client";

import { use } from "react";
import Link from "next/link";
import { useSpaceConfig } from "@/lib/api";
import SettingsEditor from "@/components/SettingsEditor";

export default function SettingsPage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = use(params);
  const { emotions, actions, pushoverRecipients, isLoading, mutate } = useSpaceConfig(spaceId);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center text-gray-500">
        Loading settings…
      </main>
    );
  }

  const k =
    emotions.map((e) => e.id).join(",") +
    "|" +
    actions.map((a) => a.id).join(",") +
    "|" +
    pushoverRecipients.map((r) => r.key).join(",");

  return (
    <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Settings</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/${spaceId}/log`} className="text-indigo-600 hover:underline">Log</Link>
          <Link href={`/${spaceId}/view`} className="text-indigo-600 hover:underline">View</Link>
        </div>
      </header>

      <SettingsEditor
        spaceId={spaceId}
        initialEmotions={emotions}
        initialActions={actions}
        initialPushoverRecipients={pushoverRecipients}
        onSaved={() => mutate()}
        key={k}
      />
    </main>
  );
}
