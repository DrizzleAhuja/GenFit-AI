import React, { useEffect, useMemo, useState } from "react";
import {
  getInstallPrompt,
  onInstallPromptAvailable,
  triggerInstall,
  isAndroid,
  isIOS,
  isMobile,
  isPWAInstalled,
} from "../utils/pwaInstall";

const DISMISS_KEY = "pwa_install_banner_dismissed_v1";

function isDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    if (!ts) return false;
    // don't nag: 7 days
    return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function dismissForAWhile() {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ ts: Date.now() }));
  } catch {
    // ignore
  }
}

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(Boolean(getInstallPrompt()));

  const device = useMemo(() => {
    return {
      mobile: isMobile(),
      android: isAndroid(),
      ios: isIOS(),
      installed: isPWAInstalled(),
    };
  }, []);

  useEffect(() => {
    if (!device.mobile) return;
    if (device.installed) return;
    if (isDismissedRecently()) return;

    // iOS has no `beforeinstallprompt`; we show an "Add to Home Screen" hint instead.
    if (device.ios) {
      setVisible(true);
      return;
    }

    // Android/Chromium: wait until the prompt becomes available.
    if (getInstallPrompt()) {
      setHasPrompt(true);
      setVisible(true);
      return;
    }

    const cleanup = onInstallPromptAvailable(() => {
      setHasPrompt(true);
      setVisible(true);
    });
    return cleanup;
  }, [device]);

  const onClose = () => {
    dismissForAWhile();
    setVisible(false);
  };

  const onInstall = async () => {
    if (device.installed) return onClose();
    if (!hasPrompt) return;
    try {
      const accepted = await triggerInstall();
      // If accepted, the browser will handle the install flow.
      if (accepted) onClose();
    } catch {
      // If something fails, keep banner visible; user can try again or close.
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] px-4 pb-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-700 bg-gray-900/95 text-white shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Install GenFit AI</div>

            {device.ios ? (
              <div className="mt-1 text-xs text-gray-300">
                On iPhone/iPad: tap <b>Share</b> → <b>Add to Home Screen</b>.
              </div>
            ) : (
              <div className="mt-1 text-xs text-gray-300">
                Get the app-like experience: faster launch, full-screen, and a home
                screen icon.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
            aria-label="Dismiss install banner"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-white/10"
          >
            Not now
          </button>

          {!device.ios && (
            <button
              type="button"
              onClick={onInstall}
              disabled={!hasPrompt}
              className="rounded-xl bg-green-500 px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


