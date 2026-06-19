import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";
import { sendPushToSpace } from "@/lib/push";
import type { LogEntry } from "@/lib/store";

export const runtime = "nodejs";

type PostBody = {
  emotionSnapshot: LogEntry["emotionSnapshot"];
  actionSnapshot: LogEntry["actionSnapshot"];
  why?: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const body = (await req.json()) as PostBody;
  if (!body?.emotionSnapshot?.name || !body?.actionSnapshot?.label) {
    return NextResponse.json({ error: "invalid log payload" }, { status: 400 });
  }
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    emotionSnapshot: body.emotionSnapshot,
    actionSnapshot: body.actionSnapshot,
    why: body.why?.trim() || undefined,
    createdAt: Date.now(),
  };
  await redis.set(keys.latest(spaceId), entry);

  // Fire-and-forget push so the POST returns fast.
  const emoji = entry.emotionSnapshot.emoji ?? "💬";
  const title = `${emoji} ${entry.emotionSnapshot.name}`;
  const actionEmoji = entry.actionSnapshot.emoji ?? "";
  const bodyText = [
    `${actionEmoji} ${entry.actionSnapshot.label}`.trim(),
    entry.why ? `"${entry.why}"` : null,
  ]
    .filter(Boolean)
    .join("\n");
  void sendPushToSpace(spaceId, {
    title,
    body: bodyText,
    url: `/${spaceId}/view`,
  }).catch((err) => console.warn("[push] failed", err));

  return NextResponse.json({ latest: entry });
}
