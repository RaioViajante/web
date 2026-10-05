"use client";

import { useEffect, useRef, useState } from "react";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEnabled(window.localStorage.getItem("rv-sound") === "on");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    function onClick(event: MouseEvent) {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest("a, button")
      )
        return;
      const context = (audio.current ??= new AudioContext());
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(580, start);
      oscillator.frequency.exponentialRampToValueAtTime(400, start + 0.055);
      gain.gain.setValueAtTime(0.012, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.06);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [enabled]);

  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );

  return (
    <button
      className="rv-sound-toggle"
      type="button"
      aria-pressed={enabled}
      aria-label={`Sound ${enabled ? "on" : "off"}`}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        window.localStorage.setItem("rv-sound", next ? "on" : "off");
      }}
    >
      SOUND <span>{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
