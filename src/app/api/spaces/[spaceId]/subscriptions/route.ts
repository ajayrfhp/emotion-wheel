import { NextRequest, NextResponse } from "next/server";
import { addSubscription, removeSubscriptionByEndpoint, StoredSubscription } from "@/lib/push";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const body = (await req.json()) as Partial<StoredSubscription>;
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }
  await addSubscription(spaceId, body as StoredSubscription);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;
  const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (!body.endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }
  await removeSubscriptionByEndpoint(spaceId, body.endpoint);
  return NextResponse.json({ ok: true });
}
