import { redis, keys } from "./redis";

const APP_TOKEN = process.env.PUSHOVER_APP_TOKEN ?? "";
const API_URL = "https://api.pushover.net/1/messages.json";

export type PushoverRecipient = { key: string; label: string };

export type PushoverPayload = {
  title: string;
  body: string;
  url?: string;
  urlTitle?: string;
};

type SpaceConfigWithPushover = {
  pushoverRecipients?: PushoverRecipient[];
};

async function listRecipients(spaceId: string): Promise<PushoverRecipient[]> {
  const cfg = await redis.get<SpaceConfigWithPushover>(keys.space(spaceId));
  return cfg?.pushoverRecipients ?? [];
}

export async function sendPushoverToSpace(spaceId: string, payload: PushoverPayload) {
  if (!APP_TOKEN) {
    console.warn("[pushover] PUSHOVER_APP_TOKEN not configured; skipping");
    return;
  }
  const recipients = await listRecipients(spaceId);
  if (recipients.length === 0) return;

  await Promise.all(
    recipients.map(async (r) => {
      try {
        const form = new URLSearchParams({
          token: APP_TOKEN,
          user: r.key,
          title: payload.title,
          message: payload.body,
          priority: "0",
        });
        if (payload.url) {
          form.set("url", payload.url);
          if (payload.urlTitle) form.set("url_title", payload.urlTitle);
        }
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn(`[pushover] send to ${r.label} failed`, res.status, text);
        }
      } catch (err) {
        console.warn(`[pushover] send to ${r.label} error`, err);
      }
    }),
  );
}
