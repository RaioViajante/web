/**
 * Wires the sound toggle markup (`[data-sound-toggle]`) to the shared player.
 * Rendering stays static; the label is set from the shared preference after
 * load, and nothing plays until the visitor interacts.
 */
import { isLocaleId } from "../../../site/locales";
import { catalogFor } from "../catalog";
import { getSoundPlayer } from "./player";

function paint(button: Element, enabled: boolean) {
  // The words come from the locale the server rendered the toggle in; there is
  // no English fallback and nothing is read from the browser.
  const locale = (button as HTMLElement).dataset.soundLocale;
  if (!isLocaleId(locale)) return;
  const { sound } = catalogFor(locale);
  const pressed = String(enabled);
  const label = sound.aria(enabled);
  const text = enabled ? sound.on : sound.off;
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
