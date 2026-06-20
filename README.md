# Emotion Wheel

A tiny private PWA for sharing how you're feeling — and what you need — with someone you care about.

Built for couples, friends, or family who want a low-friction way to communicate emotional state without needing to find words in the moment.

🔗 **Live:** https://emotion-wheel-blond.vercel.app

## How it works

1. One person ("logger") taps an emotion on a Plutchik-style wheel
2. Picks the action they'd like in return (e.g. _give me space_, _hug me_, _just listen_, _no action needed_)
3. Optionally adds a short "why"
4. The other person ("viewer") gets a **Pushover notification** on their phone and sees the latest emotion + action card

Each pair shares one **space** via a private URL. No accounts. No public feed. Just the latest state.

## Notifications: use Pushover

Notifications are delivered via the [**Pushover**](https://pushover.net) app — a one-time **$5** purchase per platform (iOS or Android), no subscription. It's the simplest setup, works reliably in the background on both iOS and Android, and "just works" without any of the battery-optimization or PWA-install gymnastics that browser push requires.

### Setup (per recipient, ~2 minutes)

1. Install **Pushover** on your phone ([iOS](https://apps.apple.com/app/pushover-notifications/id506088175) / [Android](https://play.google.com/store/apps/details?id=net.superblock.pushover))
2. Sign up (free 30-day trial, then $5 one-time per platform)
3. Open the app → copy your **User Key** (30-character string on the main screen)
4. In Emotion Wheel, go to `/[spaceId]/settings` → **Pushover recipients** → add a row with the user key and a label (e.g. "Alex's iPhone")
5. Save. Done — notifications now arrive within ~1 second, even with the screen off.

That's it. No PWA install required, no service worker, no battery whitelisting.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | Either | Create or open a space |
| `/[spaceId]/log` | Logger | Wheel, action picker, why textarea |
| `/[spaceId]/view` | Viewer | Latest emotion + action |
| `/[spaceId]/settings` | Either | Customize emotions, actions, and Pushover recipients |

## Features

- 🎡 **Editable emotion wheel** — 8 Plutchik emotions out of the box, fully customizable per space
- 🎯 **Action picker** — each emotion has a default action; pick a different one per log
- 📲 **Reliable notifications via Pushover** — works on iOS & Android in the background, no PWA install needed
- 📦 **PWA installable** — optional; add to home screen on Android / iOS / desktop
- 🔒 **No accounts** — single shared secret URL per space
- 💾 **Persistent across devices** — Upstash Redis storage

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4**
- **SWR** for client data, 5s polling on viewer
- **Upstash Redis** (via Vercel KV integration) for state
- **Pushover** for push notifications
- Deployed on **Vercel**

## Local development

```bash
npm install
npm run dev
```

Then visit http://localhost:3000.

## Self-host your own copy

If you want to run this for yourself (recommended — every space ID is a shared secret URL, so don't share infra with anyone else):

### 1. Fork & clone

```bash
gh repo fork ajayrfhp/emotion-wheel --clone
cd emotion-wheel
npm install
```

### 2. Provision a Vercel KV (Upstash Redis) store

1. Go to https://vercel.com/dashboard → **Storage** → **Create** → pick **Upstash KV** (Redis)
2. Name it anything (e.g. `emotion-wheel-kv`)
3. Vercel will give you `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Copy them.

### 3. Get a Pushover application token

1. Sign up at https://pushover.net (free for the server side)
2. Go to https://pushover.net/apps/build → create a new application (name it e.g. "Emotion Wheel")
3. Copy the **API Token/Key**

### 4. Create `.env.local`

```env
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

PUSHOVER_APP_TOKEN=...
```

### 5. Deploy

```bash
npx vercel link
npx vercel env pull    # pulls the KV vars from your Vercel project
echo "your-pushover-app-token" | npx vercel env add PUSHOVER_APP_TOKEN production
npx vercel --prod
```

### 6. Create your space

Open the deployed URL → click **Create new space** → bookmark the resulting URL. Send the same URL to whoever you're sharing with. That's the only "auth" — there are no accounts.

Then each recipient follows the **Setup** steps in the Notifications section above to register their Pushover user key.

### 7. (Optional) Auto-deploy on push

In Vercel project settings → Git → connect your forked GitHub repo. Then every `git push` to `main` deploys.

### Required environment variables (reference)

```
# Upstash Redis (from Vercel KV integration)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Pushover application token — create at https://pushover.net/apps/build
PUSHOVER_APP_TOKEN=...
```

## Project structure

```
src/
  app/
    [spaceId]/{log,view,settings}/page.tsx   # the three main pages
    api/spaces/[spaceId]/                     # config, latest, logs
  components/
    EmotionWheel.tsx                          # SVG pie wheel
    SettingsEditor.tsx                        # per-space customization + Pushover recipients
  lib/
    emotions.ts                               # default emotions & actions
    redis.ts                                  # Upstash client + key helpers
    pushover.ts                               # Pushover send helper
    api.ts                                    # SWR hooks
    store.ts                                  # localStorage helpers
public/
  manifest.webmanifest                        # PWA manifest
  icon-*.png                                  # generated by scripts/gen-icons.mjs
```

## License

Personal project — no license. Fork freely for your own use.
