import { Redis } from "@upstash/redis";

// Upstash gives both KV_REST_API_* (Vercel KV style) and UPSTASH_REDIS_REST_*.
// Try Vercel KV vars first, fall back to Upstash native vars.
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  // Throw lazily so importing this module during build doesn't crash.
  // Actual requests will fail loudly with a clear message.
  console.warn("[redis] Missing KV_REST_API_URL or KV_REST_API_TOKEN env vars");
}

export const redis = new Redis({ url: url ?? "", token: token ?? "" });

export const keys = {
  space: (id: string) => `ew:space:${id}`,
  latest: (id: string) => `ew:latest:${id}`,
};
