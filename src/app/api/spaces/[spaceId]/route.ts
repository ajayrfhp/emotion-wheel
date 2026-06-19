import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";
import { DEFAULT_EMOTIONS, DEFAULT_ACTIONS, Emotion, Action } from "@/lib/emotions";

export const runtime = "nodejs";

type SpaceConfig = { emotions: Emotion[]; actions: Action[] };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const raw = await redis.get<SpaceConfig>(keys.space(spaceId));
  if (raw) return NextResponse.json(raw);
  const seeded: SpaceConfig = { emotions: DEFAULT_EMOTIONS, actions: DEFAULT_ACTIONS };
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
  const next: SpaceConfig = { emotions: body.emotions, actions: body.actions };
  await redis.set(keys.space(spaceId), next);
  return NextResponse.json(next);
}
