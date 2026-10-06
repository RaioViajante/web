/**
 * Wires the sound toggle markup (`[data-sound-toggle]`) to the shared player.
 * Rendering stays static; the label is set from the shared preference after
 * load, and nothing plays until the visitor interacts.
 */
import { getSoundPlayer } from "./player";

function paint(button: Element, enabled: boolean) {
  const pressed = String(enabled);
  const label = `Sound ${enabled ? "on" : "off"}. Click to ${enabled ? "mute" : "enable"}.`;
  const text = enabled ? "ON" : "OFF";
  if (button.getAttribute("aria-pressed") !== pressed)
    button.setAttribute("aria-pressed", pressed);
  if (button.getAttribute("aria-label") !== label)
    button.setAttribute("aria-label", label);
  const state = button.querySelector("span");
  if (state && state.textContent !== text) state.textContent = text;
}

export function initSound() {
  const player = getSoundPlayer();
  // Query on every paint: a client-side navigation replaces the toggle, and
  // the new one must show the shared preference. Painting is idempotent, so
  // watching the DOM for new toggles cannot loop.
  const paintAll = () =>
    document
      .querySelectorAll("[data-sound-toggle]")
      .forEach((button) => paint(button, player.isEnabled()));
  paintAll();
  const unsubscribe = player.subscribe(paintAll);
  const observer = new MutationObserver(paintAll);
  observer.observe(document.body, { childList: true, subtree: true });
  const onClick = (event: Event) => {
    const button = (event.target as Element | null)?.closest?.(
      "[data-sound-toggle]",
    );
    if (button) player.setEnabled(!player.isEnabled());
  };
  document.addEventListener("click", onClick);
  return () => {
    unsubscribe();
    observer.disconnect();
    document.removeEventListener("click", onClick);
  };
}
