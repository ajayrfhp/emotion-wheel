import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";
import { DEFAULT_EMOTIONS, DEFAULT_ACTIONS, Emotion, Action } from "@/lib/emotions";
import type { PushoverRecipient } from "@/lib/pushover";

export const runtime = "nodejs";

type SpaceConfig = {
  emotions: Emotion[];
  actions: Action[];
  pushoverRecipients?: PushoverRecipient[];
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const raw = await redis.get<SpaceConfig>(keys.space(spaceId));
  if (raw) {
    // Backfill missing field so the UI always sees an array.
    return NextResponse.json({ pushoverRecipients: [], ...raw });
  }
  const seeded: SpaceConfig = {
    emotions: DEFAULT_EMOTIONS,
    actions: DEFAULT_ACTIONS,
    pushoverRecipients: [],
  };
  await redis.set(keys.space(spaceId), seeded);
  return NextResponse.json(seeded);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const body = (await req.json()) as Partial<SpaceConfig>;
  if (!Array.isArray(body.emotions) || !Array.isArray(body.actions)) {
    return NextResponse.json({ error: "emotions and actions required" }, { status: 400 });
  }
  const recipients = Array.isArray(body.pushoverRecipients)
    ? body.pushoverRecipients
        .filter((r): r is PushoverRecipient =>
          !!r && typeof r.key === "string" && typeof r.label === "string" && r.key.trim().length > 0,
        )
        .map((r) => ({ key: r.key.trim(), label: r.label.trim() || "Recipient" }))
    : [];
  const next: SpaceConfig = {
    emotions: body.emotions,
    actions: body.actions,
    pushoverRecipients: recipients,
  };
  await redis.set(keys.space(spaceId), next);
  return NextResponse.json(next);
}
