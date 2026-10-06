/**
 * Wires the sound toggle markup (`[data-sound-toggle]`) to the shared player.
 * Rendering stays static; the label is set from the shared preference after
 * load, and nothing plays until the visitor interacts.
 */
import { getSoundPlayer } from "./player";

function paint(button: HTMLElement, enabled: boolean) {
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute(
    "aria-label",
    `Sound ${enabled ? "on" : "off"}. Click to ${enabled ? "mute" : "enable"}.`,
  );
  const state = button.querySelector("span");
  if (state) state.textContent = enabled ? "ON" : "OFF";
}

export function initSound() {
  const player = getSoundPlayer();
  const buttons = [
    ...document.querySelectorAll<HTMLElement>("[data-sound-toggle]"),
  ];
  const update = (enabled: boolean) =>
    buttons.forEach((button) => paint(button, enabled));
  update(player.isEnabled());
  const unsubscribe = player.subscribe(update);
  const onClick = (event: Event) => {
    const button = (event.target as Element | null)?.closest?.(
      "[data-sound-toggle]",
    );
    if (button) player.setEnabled(!player.isEnabled());
  };
  document.addEventListener("click", onClick);
  return () => {
    unsubscribe();
    document.removeEventListener("click", onClick);
  };
}
