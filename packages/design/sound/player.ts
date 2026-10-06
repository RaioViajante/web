/**
 * The shared sound player: one preference, one synth, driven by `data-sound`.
 *
 * Nothing plays on load. Audio starts only after the visitor enables sound
 * (or had enabled it before) and then interacts with the page. With reduced
 * motion, incidental sounds (hover and typing ticks) are skipped; sounds that
 * confirm an action still play.
 */
import { SOUND_EVENT, HOVER_KINDS, type SoundAction } from "./events";
import { readPreference, writePreference } from "./preference";
import { createSynth } from "./synth";

type Play = (kind: string, action?: SoundAction) => void;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isIncidental(kind: string, action: SoundAction) {
  return action === "hover" || kind === "tick" || kind === "typing";
}

/** Attaches the delegated listeners driven by `data-sound`. Returns a detach function. */
export function attachSoundEvents(play: Play) {
  function onHover(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const element = target.closest<HTMLElement>("[data-sound]");
    if (
      !element ||
      element.dataset.soundOn === "click" ||
      !HOVER_KINDS.has(element.dataset.sound ?? "nav") ||
      (!element.matches("a, button") && !element.querySelector("a, button")) ||
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

  function onInput(event: Event) {
    if (!(event instanceof InputEvent) || event.isComposing) return;
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) ||
      (target.dataset.sound !== "typing" && target.dataset.sound !== "tick")
    )
      return;
    if (
      event.inputType === "insertText" ||
      event.inputType === "deleteContentBackward" ||
      event.inputType === "deleteContentForward"
    ) {
      play(target.dataset.sound, "click");
    }
  }

  function onRequest(event: Event) {
    const kind = event instanceof CustomEvent ? event.detail : null;
    if (typeof kind === "string") play(kind, "click");
  }

  function onGalleryReveal() {
    play("gallery-reveal", "click");
  }

  document.addEventListener("pointerover", onHover);
  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  window.addEventListener(SOUND_EVENT, onRequest);
  window.addEventListener("rv-gallery-reveal", onGalleryReveal);
  return () => {
    document.removeEventListener("pointerover", onHover);
    document.removeEventListener("click", onClick);
    document.removeEventListener("input", onInput);
    window.removeEventListener(SOUND_EVENT, onRequest);
    window.removeEventListener("rv-gallery-reveal", onGalleryReveal);
  };
}

/** Asks the player to play a kind, for example `playSound("success")`. A no-op while sound is off. */
export function playSound(kind: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: kind }));
}

export interface SoundPlayer {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  subscribe(listener: (enabled: boolean) => void): () => void;
}

let shared: SoundPlayer | null = null;

/** The page-wide player. Created on first use in the browser. */
export function getSoundPlayer(): SoundPlayer {
  if (shared) return shared;
  const synth = createSynth();
  const listeners = new Set<(enabled: boolean) => void>();
  let enabled = readPreference();
  let detach: (() => void) | null = null;

  const play: Play = (kind, action = "hover") => {
    if (isIncidental(kind, action) && prefersReducedMotion()) return;
    synth.play(kind, action);
  };

  function apply() {
    detach?.();
    detach = null;
    if (enabled) detach = attachSoundEvents(play);
    else synth.close();
  }
  apply();

  shared = {
    isEnabled: () => enabled,
    setEnabled(next) {
      if (next === enabled) return;
      enabled = next;
      writePreference(next);
      if (next) synth.resume();
      apply();
      if (next) play("toggle", "click");
      listeners.forEach((listener) => listener(enabled));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return shared;
}
