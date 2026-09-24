"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Type } from "lucide-react";

const storageKey = "govguide-easy-mode";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

function getSnapshot() {
  return window.localStorage.getItem(storageKey) === "on";
}

function getServerSnapshot() {
  return false;
}

interface EasyModeToggleProps {
  /**
   * `full` renders the labelled switch (mobile sheet, wide layouts).
   * `icon` renders a compact 44px control for the dense desktop utility
   * cluster, keeping the same pressed state and accessible name.
   */
  variant?: "full" | "icon";
}

export function EasyModeToggle({ variant = "full" }: EasyModeToggleProps) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("easy-mode", enabled);
  }, [enabled]);

  function toggle() {
    const next = !enabled;
    window.localStorage.setItem(storageKey, next ? "on" : "off");
    document.cookie = `govguide-easy-mode=${next ? "on" : "off"}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.classList.toggle("easy-mode", next);
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: next ? "on" : "off" }));
  }

  const stateLabel = `Easy Mode: ${enabled ? "On" : "Off"}`;
  const hint = "Increase text size and touch target size";

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-pressed={enabled}
        onClick={toggle}
        aria-label={stateLabel}
        title={`${hint} (${stateLabel})`}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-xs transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-95 ${
          enabled
            ? "border-transparent brand-gradient text-white shadow-md"
            : "border-slate-200/80 bg-white/70 text-slate-500 hover:border-teal-700/30 hover:bg-white hover:text-teal-800"
        }`}
      >
        <Type className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={toggle}
      title={hint}
      className={`min-h-11 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-xs transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
        enabled
          ? "border-transparent brand-gradient text-white shadow-md"
          : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-800"
      }`}
    >
      {stateLabel}
    </button>
  );
}
