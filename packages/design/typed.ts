/**
 * Typed page titles (components/typed-title.tsx) type once. A title is done
 * when its caret has blinked out, or at once when the visitor asks for
 * reduced motion; `styles/typed.css` never animates a done title again, so
 * switching reduced motion off later, or any restyle, does not replay it.
 * A client-side navigation renders new, untyped titles.
 */
import { reducedMotionQuery } from "./reduced-motion";

const done = (title: Element) => title.setAttribute("data-typed", "done");

/** Marks every title on the page done. */
export function settleTypedTitles() {
  document.querySelectorAll(".rv-typed:not([data-typed])").forEach(done);
}

export function attachTypedTitles() {
  const onEnd = (event: AnimationEvent) => {
    if (event.animationName !== "rv-caret") return;
    const title = (event.target as Element).closest(".rv-typed");
    if (title) done(title);
  };
  const query = reducedMotionQuery();
  const onChange = () => {
    if (query.matches) settleTypedTitles();
  };
  document.addEventListener("animationend", onEnd);
  query.addEventListener("change", onChange);
  onChange();
  return () => {
    document.removeEventListener("animationend", onEnd);
    query.removeEventListener("change", onChange);
  };
}
