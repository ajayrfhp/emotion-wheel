"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "ew:ios-a2hs-dismissed";

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPad on iOS 13+ reports as Mac, so also check for touch.
  return /iPhone|iPad|iPod/i.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  // iOS uses navigator.standalone; other browsers use display-mode media query.
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export default function InstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIos()) return;
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    // Reading client-only APIs (navigator, localStorage) requires an effect
    // to avoid SSR hydration mismatches. This is a one-shot hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 p-4 text-sm mb-4 flex flex-col gap-2">
      <div className="font-semibold flex items-center gap-2">
        📱 Add to Home Screen
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
        For notifications and a cleaner experience: tap{" "}
        <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-current text-[10px] align-middle">
          ⬆️
        </span>{" "}
        in Safari, then <strong>&ldquo;Add to Home Screen&rdquo;</strong>. Then open this page
        from your home screen.
      </p>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setShow(false);
        }}
        className="self-end text-xs text-gray-500 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}
