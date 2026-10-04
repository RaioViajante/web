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

    function play(kind: string) {
      const context = (audio.current ??= new AudioContext());
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(kind === "flip" ? 520 : 660, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        kind === "flip" ? 780 : 880,
        start + 0.09,
      );
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.028, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + (kind === "flip" ? 0.2 : 0.11),
      );
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + (kind === "flip" ? 0.21 : 0.12));
    }

    function onHover(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest<HTMLElement>("[data-sound]");
      if (
        !element ||
        (event.relatedTarget instanceof Node &&
          element.contains(event.relatedTarget))
      )
        return;
      play(element.dataset.sound ?? "nav");
    }

    document.addEventListener("pointerover", onHover);
    return () => document.removeEventListener("pointerover", onHover);
  }, [enabled]);

  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );

  return (
    <button
      type="button"
      className="rv-sound-toggle"
      aria-label={`Sound ${enabled ? "on" : "off"}. Click to ${enabled ? "mute" : "enable"}.`}
      aria-pressed={enabled}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        window.localStorage.setItem("rv-sound", next ? "on" : "off");
      }}
    >
      SOUND <span aria-hidden="true">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
