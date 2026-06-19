import { NextRequest, NextResponse } from "next/server";
import { redis, keys } from "@/lib/redis";
import type { LogEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const latest = await redis.get<LogEntry | null>(keys.latest(spaceId));
  return NextResponse.json({ latest: latest ?? null });
}
