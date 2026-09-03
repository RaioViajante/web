"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "dump-theme";
const THEME_CHANGE_EVENT = "dump-theme-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerTheme(): null {
  return null;
}

function SunIcon() {
  return (
    <svg
      className="theme-icon theme-icon--sun"
      width="17"
      height="17"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3.4" fill="currentColor" />
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.15"
      >
        <path d="M13 8h1.9M11.54 11.54l1.34 1.34M8 13v1.9M4.46 11.54l-1.34 1.34M3 8H1.1M4.46 4.46L3.12 3.12M8 3V1.1M11.54 4.46l1.34-1.34" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="theme-icon theme-icon--moon"
      width="17"
      height="17"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" fill="currentColor" />
      <circle cx="10.6" cy="5.6" r="5.2" fill="var(--bg)" />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    getTheme,
    getServerTheme,
  );

  if (theme === null) return null;

  const isDark = theme === "dark";

  function toggleTheme() {
    const nextTheme: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The theme still changes when storage is unavailable.
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
