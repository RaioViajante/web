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

    function play(kind: string, action: "hover" | "click" = "hover") {
      const context = (audio.current ??= new AudioContext());
      if (context.state === "suspended") void context.resume();
      const pulse = (
        delay: number,
        frequency: number,
        duration: number,
        volume: number,
      ) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + delay;
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(
          frequency * 0.64,
          start + duration,
        );
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.005);
      };

      const paperTap = (delay: number, volume: number) => {
        const duration = 0.055;
        const start = context.currentTime + delay;
        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * duration),
          context.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index++) {
          samples[index] =
            (Math.random() * 2 - 1) * (1 - index / samples.length);
        }

        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.value = 1400;
        filter.Q.value = 0.7;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        source.connect(filter).connect(gain).connect(context.destination);
        source.start(start);
        source.stop(start + duration);
      };

      if (kind === "flip") {
        pulse(0, 690, 0.075, 0.022);
        pulse(0.13, 820, 0.085, 0.018);
      } else if (kind === "gallery-reveal") {
        paperTap(0, 0.009);
        paperTap(0.12, 0.007);
        paperTap(0.25, 0.006);
      } else if (kind === "gallery") {
        paperTap(0, action === "click" ? 0.009 : 0.005);
        pulse(0, action === "click" ? 600 : 480, 0.045, 0.006);
      } else if (action === "click") {
        pulse(0, 620, 0.06, 0.017);
        pulse(0.065, 810, 0.075, 0.012);
      } else {
        pulse(0, 430, 0.045, 0.012);
      }
    }

    function onHover(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest<HTMLElement>("[data-sound]");
      if (
        !element ||
        element.dataset.soundOn === "click" ||
        (!element.matches("a, button") &&
          !element.querySelector("a, button")) ||
        (event.relatedTarget instanceof Node &&
          element.contains(event.relatedTarget))
      )
        return;
      play(element.dataset.sound ?? "nav");
    }

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest("a, button");
      const element = control?.closest<HTMLElement>("[data-sound]");
      if (element) play(element.dataset.sound ?? "nav", "click");
    }

    function onGalleryReveal() {
      if (audio.current?.state === "running") play("gallery-reveal");
    }

    document.addEventListener("pointerover", onHover);
    document.addEventListener("click", onClick);
    window.addEventListener("rv-gallery-reveal", onGalleryReveal);
    return () => {
      document.removeEventListener("pointerover", onHover);
      document.removeEventListener("click", onClick);
      window.removeEventListener("rv-gallery-reveal", onGalleryReveal);
    };
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
        if (next) {
          const context = (audio.current ??= new AudioContext());
          if (context.state === "suspended") void context.resume();
        }
        setEnabled(next);
        window.localStorage.setItem("rv-sound", next ? "on" : "off");
      }}
    >
      SOUND <span aria-hidden="true">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
