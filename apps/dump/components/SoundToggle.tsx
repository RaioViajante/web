"use client";

import { useEffect, useRef, useState } from "react";
import {
  attachEditorialSoundEvents,
  createEditorialSound,
} from "@raioviajante/design/editorial-sound";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const sound = useRef<ReturnType<typeof createEditorialSound> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEnabled(window.localStorage.getItem("rv-sound") === "on");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = (sound.current ??= createEditorialSound());
    return attachEditorialSoundEvents(controller.play);
  }, [enabled]);

  useEffect(
    () => () => {
      sound.current?.close();
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
        if (next) (sound.current ??= createEditorialSound()).resume();
        setEnabled(next);
        window.localStorage.setItem("rv-sound", next ? "on" : "off");
      }}
    >
      SOUND <span aria-hidden="true">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
