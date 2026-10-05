/** Browser audio and interaction delegation shared by the editorial sites. */
export type EditorialSoundAction = "hover" | "click";

export function createEditorialSound() {
  let audio: AudioContext | null = null;

  function context() {
    const current = (audio ??= new AudioContext());
    if (current.state === "suspended") void current.resume();
    return current;
  }

  function play(kind: string, action: EditorialSoundAction = "hover") {
    const current = context();
    const pulse = (
      delay: number,
      frequency: number,
      duration: number,
      volume: number,
    ) => {
      const oscillator = current.createOscillator();
      const gain = current.createGain();
      const start = current.currentTime + delay;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 0.64,
        start + duration,
      );
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(current.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.005);
    };

    const paperTap = (delay: number, volume: number) => {
      const duration = 0.055;
      const start = current.currentTime + delay;
      const buffer = current.createBuffer(
        1,
        Math.ceil(current.sampleRate * duration),
        current.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index++) {
        samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
      }
      const source = current.createBufferSource();
      const filter = current.createBiquadFilter();
      const gain = current.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter).connect(gain).connect(current.destination);
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
    } else if (kind === "typing") {
      paperTap(0, 0.003);
    } else if (action === "click") {
      pulse(0, 620, 0.06, 0.017);
      pulse(0.065, 810, 0.075, 0.012);
    } else {
      pulse(0, 430, 0.045, 0.012);
    }
  }

  return {
    play,
    resume: () => {
      context();
    },
    close: () => {
      if (audio) void audio.close();
      audio = null;
    },
  };
}

export function attachEditorialSoundEvents(
  play: (kind: string, action?: EditorialSoundAction) => void,
) {
  function onHover(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const element = target.closest<HTMLElement>("[data-sound]");
    if (
      !element ||
      element.dataset.soundOn === "click" ||
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

  function onGalleryReveal() {
    play("gallery-reveal", "click");
  }

  function onTyping(event: Event) {
    if (!(event instanceof InputEvent) || event.isComposing) return;
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) ||
      target.dataset.sound !== "typing"
    )
      return;
    if (
      event.inputType === "insertText" ||
      event.inputType === "deleteContentBackward" ||
      event.inputType === "deleteContentForward"
    ) {
      play("typing", "click");
    }
  }

  document.addEventListener("pointerover", onHover);
  document.addEventListener("click", onClick);
  document.addEventListener("input", onTyping);
  window.addEventListener("rv-gallery-reveal", onGalleryReveal);
  return () => {
    document.removeEventListener("pointerover", onHover);
    document.removeEventListener("click", onClick);
    document.removeEventListener("input", onTyping);
    window.removeEventListener("rv-gallery-reveal", onGalleryReveal);
  };
}
