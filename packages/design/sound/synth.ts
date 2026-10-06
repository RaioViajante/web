/**
 * Web Audio synthesis for every RaioViajante sound. There are no audio files:
 * each voice is a few triangle pulses and filtered noise taps, kept quiet.
 */
import type { SoundAction, SoundKind } from "./events";
import { HOVER_THROTTLE_MS, TICK_THROTTLE_MS } from "./events";

type Voice = (tools: VoiceTools, action: SoundAction) => void;

interface VoiceTools {
  pulse(
    delay: number,
    frequency: number,
    duration: number,
    volume: number,
    glide?: number,
  ): void;
  tap(delay: number, volume: number): void;
}

function createTools(context: AudioContext): VoiceTools {
  return {
    pulse(delay, frequency, duration, volume, glide = 0.64) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + delay;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * glide,
        start + duration,
      );
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.005);
    },
    tap(delay, volume) {
      const duration = 0.055;
      const start = context.currentTime + delay;
      const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * duration),
        context.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index++) {
        samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
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
    },
  };
}

const hover: Voice = ({ pulse }) => pulse(0, 430, 0.045, 0.012);
const click: Voice = ({ pulse }) => {
  pulse(0, 620, 0.06, 0.017);
  pulse(0.065, 810, 0.075, 0.012);
};
const tick: Voice = ({ tap }) => tap(0, 0.003);
const flip: Voice = ({ pulse }) => {
  pulse(0, 690, 0.075, 0.022);
  pulse(0.13, 820, 0.085, 0.018);
};

/** Voices by kind. `nav` is the original root pair: soft on hover, two-note on click. */
const voices: Record<SoundKind, Voice> = {
  nav: (tools, action) => (action === "click" ? click : hover)(tools, action),
  hover,
  click,
  tick,
  typing: tick,
  flip,
  toggle: flip,
  open: ({ pulse }) => {
    pulse(0, 520, 0.06, 0.016, 1.15);
    pulse(0.07, 780, 0.085, 0.014, 1.1);
  },
  copy: ({ pulse, tap }) => {
    tap(0, 0.008);
    pulse(0.03, 760, 0.05, 0.011);
  },
  success: ({ pulse }) => {
    pulse(0, 560, 0.07, 0.016, 1);
    pulse(0.08, 740, 0.07, 0.016, 1);
    pulse(0.16, 930, 0.11, 0.014, 0.9);
  },
  reject: ({ pulse }) => {
    pulse(0, 300, 0.09, 0.012, 0.8);
    pulse(0.09, 240, 0.13, 0.01, 0.8);
  },
  "gallery-reveal": ({ tap }) => {
    tap(0, 0.009);
    tap(0.12, 0.007);
    tap(0.25, 0.006);
  },
  gallery: ({ pulse, tap }, action) => {
    tap(0, action === "click" ? 0.009 : 0.005);
    pulse(0, action === "click" ? 600 : 480, 0.045, 0.006);
  },
};

export function createSynth() {
  let audio: AudioContext | null = null;
  const lastPlayed = new Map<SoundKind, number>();

  function context() {
    const current = (audio ??= new AudioContext());
    if (current.state === "suspended") void current.resume();
    return current;
  }

  /** Hover-class voices and ticks are rate limited; clicks never are. */
  function rateLimited(kind: SoundKind, action: SoundAction) {
    const interval =
      kind === "tick" || kind === "typing"
        ? TICK_THROTTLE_MS
        : action === "hover"
          ? HOVER_THROTTLE_MS
          : 0;
    if (!interval) return false;
    const now = performance.now();
    if (now - (lastPlayed.get(kind) ?? -Infinity) < interval) return true;
    lastPlayed.set(kind, now);
    return false;
  }

  return {
    play(kind: string, action: SoundAction = "hover") {
      const resolved = (kind in voices ? kind : "nav") as SoundKind;
      if (rateLimited(resolved, action)) return;
      voices[resolved](createTools(context()), action);
    },
    resume: () => {
      context();
    },
    close: () => {
      if (audio) void audio.close();
      audio = null;
    },
  };
}
