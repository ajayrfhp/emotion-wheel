# Emotion Wheel

A tiny private PWA for sharing how you're feeling — and what you need — with someone you care about.

Built for couples, friends, or family who want a low-friction way to communicate emotional state without needing to find words in the moment.

🔗 **Live:** https://emotion-wheel-blond.vercel.app

## How it works

1. One person ("logger") taps an emotion on a Plutchik-style wheel
2. Picks the action they'd like in return (e.g. _give me space_, _hug me_, _just listen_, _no action needed_)
3. Optionally adds a short "why"
4. The other person ("viewer") gets a push notification on their phone and sees the latest emotion + action card

Each pair shares one **space** via a private URL. No accounts. No public feed. Just the latest state.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | Either | Create or open a space |
| `/[spaceId]/log` | Logger | Wheel, action picker, why textarea |
| `/[spaceId]/view` | Viewer | Latest emotion + action, push toggle |
| `/[spaceId]/settings` | Either | Customize emotions & actions for this space |

## Features

- 🎡 **Editable emotion wheel** — 8 Plutchik emotions out of the box, fully customizable per space
- 🎯 **Action picker** — each emotion has a default action; pick a different one per log
- 📲 **Web push notifications** — works on Android Chrome and iOS Safari (PWA install required for iOS)
- 📦 **PWA installable** — add to home screen on Android / iOS / desktop
- 🔒 **No accounts** — single shared secret URL per space
- 💾 **Persistent across devices** — Upstash Redis storage

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4**
- **SWR** for client data, 5s polling on viewer
- **Upstash Redis** (via Vercel KV integration) for state
- **web-push** + VAPID for browser push
- **Service Worker** for shell caching, push handling, notification display
- Deployed on **Vercel**

## Local development

```bash
npm install
npm run dev
```

To test the PWA / push features locally you need a production build (SW is dev-gated):

```bash
npm run build
npm run start
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
3. Vercel will give you 4 env vars: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`. Copy them.

### 3. Generate VAPID keys for web push

```bash
npx web-push generate-vapid-keys
```

Copy the public and private keys.

### 4. Create `.env.local`

```env
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # same value as VAPID_PUBLIC_KEY
```

### 5. Deploy

```bash
npx vercel link
npx vercel env pull    # pulls the KV vars from your Vercel project
# then add VAPID_* manually:
echo "your-public-key" | npx vercel env add VAPID_PUBLIC_KEY production
echo "your-private-key" | npx vercel env add VAPID_PRIVATE_KEY production
echo "mailto:you@example.com" | npx vercel env add VAPID_SUBJECT production
echo "your-public-key" | npx vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production
npx vercel --prod
```

### 6. Create your space

Open the deployed URL → click **Create new space** → bookmark the resulting URL. Send the same URL to whoever you're sharing with. That's the only "auth" — there are no accounts.

### 7. (Optional) Auto-deploy on push

In Vercel project settings → Git → connect your forked GitHub repo. Then every `git push` to `main` deploys.

### Required environment variables (reference)

Create `.env.local`:

```
# Upstash Redis (from Vercel KV integration)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# VAPID keys for web push — generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # same as VAPID_PUBLIC_KEY
```

## Project structure

```
src/
  app/
    [spaceId]/{log,view,settings}/page.tsx   # the three main pages
    api/spaces/[spaceId]/                     # config, latest, logs, subscriptions
  components/
    EmotionWheel.tsx                          # SVG pie wheel
    SettingsEditor.tsx                        # per-space customization
    NotificationToggle.tsx                    # push enable/disable
    InstallHint.tsx                           # iOS Add-to-Home-Screen guide
    ServiceWorkerRegistrar.tsx                # prod-only SW registration
  lib/
    emotions.ts                               # default emotions & actions
    redis.ts                                  # Upstash client + key helpers
    push.ts                                   # VAPID config + send/store subs
    api.ts                                    # SWR hooks
    store.ts                                  # localStorage helpers
public/
  sw.js                                       # service worker (cache + push)
  manifest.webmanifest                        # PWA manifest
  icon-*.png                                  # generated by scripts/gen-icons.mjs
```

## Notes on push

- **Android Chrome:** works in the background as long as Chrome is set to *Unrestricted* battery use. Aggressive OEM battery managers (Samsung, Xiaomi, OnePlus) may need extra whitelisting.
- **iOS Safari:** push requires the site to be installed as a PWA first (Add to Home Screen). The `InstallHint` card on `/view` guides this.
- **Latency:** ~1–30s depending on OS doze state. Pushes are sent with `urgency: "high"`.

### Setting up push notifications on Android

If notifications aren't arriving on your Android phone, walk through these in order:

**1. Enable on the site**
- Open `/view` for your space in Chrome
- Tap **"Enable notifications"** and **Allow** in the browser prompt
- The toggle should read "🔔 Notifications on"

**2. Allow Chrome to run in the background** (this is the #1 issue)
- Settings → Apps → **Chrome** → Battery → set to **Unrestricted** (or "No restrictions")
- Settings → Apps → **Chrome** → Mobile data & Wi-Fi → enable **Background data** and **Unrestricted data usage**

**3. OEM-specific battery managers** (Android often kills Chrome silently)
- **Samsung:** Settings → Battery → Background usage limits → remove Chrome from *Sleeping apps* and *Deep sleeping apps*
- **Xiaomi / MIUI:** Security app → Battery → App battery saver → Chrome → *No restrictions*; also Autostart → enable Chrome
- **OnePlus / Oppo:** Settings → Battery → Battery optimization → Chrome → *Don't optimize*
- **Huawei / Honor:** Settings → Apps → Chrome → Battery → enable *Auto-launch* and *Run in background*

**4. Confirm Chrome's notification channel is on**
- Settings → Apps → Chrome → Notifications → ensure the master toggle **and** the *Sites* channel are both on

**5. Site-level permission**
- Open the site in Chrome → tap the lock icon in the URL bar → Permissions → Notifications → **Allow**

**6. If push still doesn't arrive: confirm FCM is reaching the device**
- Open `chrome://gcm-internals` in Chrome on the phone
- Scroll to **Receive Message Log**
- Trigger a push from another device (log an emotion)
- If a new entry appears in the log → FCM delivered the push to the device, but the service worker didn't show it (try unregistering the SW at `chrome://serviceworker-internals` and re-enabling notifications)
- If no entry appears → the device isn't receiving FCM at all (check Google Play Services is running and updated, and the device has Internet)

**7. Re-subscribe if state is stale**
- On `/view`, tap **Turn off**, reload the page, then tap **Enable notifications** again. This forces a fresh subscription POST to the server.

### Setting up push notifications on iPhone

iOS only allows web push from installed PWAs (iOS 16.4+). Steps:

1. Open the site in **Safari** (Chrome on iOS uses Safari's engine but doesn't expose push)
2. Tap the Share button → **Add to Home Screen**
3. Open the app **from the home screen icon** (not from Safari)
4. On `/view`, tap **Enable notifications** and Allow when prompted

## License

Personal project — no license. Fork freely for your own use.
