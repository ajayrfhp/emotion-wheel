import webpush, { PushSubscription } from "web-push";
import { redis, keys } from "./redis";

const publicKey = process.env.VAPID_PUBLIC_KEY ?? "";
const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
const subject = process.env.VAPID_SUBJECT ?? "mailto:noreply@example.com";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

// We store subscriptions in a Redis hash where the field is the endpoint
// (hashed to keep keys small) and the value is the subscription JSON.
function endpointHash(endpoint: string): string {
  // Simple deterministic hash — endpoint already unique, this just shortens it.
  let h = 0;
  for (let i = 0; i < endpoint.length; i++) {
    h = (h * 31 + endpoint.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export async function addSubscription(spaceId: string, sub: StoredSubscription) {
  const field = endpointHash(sub.endpoint);
  await redis.hset(keys.pushSubs(spaceId), { [field]: JSON.stringify(sub) });
}

export async function removeSubscriptionByEndpoint(spaceId: string, endpoint: string) {
  const field = endpointHash(endpoint);
  await redis.hdel(keys.pushSubs(spaceId), field);
}

export async function listSubscriptions(spaceId: string): Promise<StoredSubscription[]> {
  const raw = (await redis.hgetall<Record<string, string>>(keys.pushSubs(spaceId))) ?? {};
  const out: StoredSubscription[] = [];
  for (const v of Object.values(raw)) {
    try {
      // Upstash auto-parses JSON values stored as objects; handle both.
      out.push(typeof v === "string" ? (JSON.parse(v) as StoredSubscription) : (v as StoredSubscription));
    } catch {
      // ignore corrupt entries
    }
  }
  return out;
}

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export async function sendPushToSpace(spaceId: string, payload: PushPayload) {
  if (!publicKey || !privateKey) {
    console.warn("[push] VAPID keys not configured; skipping push");
    return;
  }
  const subs = await listSubscriptions(spaceId);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as PushSubscription, JSON.stringify(payload), {
          TTL: 60,
          urgency: "high",
        });
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          // Subscription expired — prune.
          await removeSubscriptionByEndpoint(spaceId, sub.endpoint);
        } else {
          console.warn("[push] send failed", status, err);
        }
      }
    }),
  );
}
