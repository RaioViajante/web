"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "@raioviajante/design/reduced-motion";
import type { StuccoCopy, StuccoDevice } from "../../lib/stucco";

const DEMO = "/work/stucco/";
const OPEN_MS = 620;
const CLOSE_MS = 420;

function inView(element: Element | null) {
  if (!element) return false;
  const { top, bottom } = element.getBoundingClientRect();
  return bottom > 60 && top < innerHeight - 60;
}

const flip = (from: DOMRect, to: DOMRect) =>
  `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`;

const demoControls =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

const focusable = (root: ParentNode, selector: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].filter(
    (element) => element.offsetParent !== null,
  );

function isSameOrigin(view: Window) {
  try {
    return Boolean(view.document);
  } catch {
    return false;
  }
}

/**
 * "Open the demo" and the layer it opens: a native modal dialog whose frame
 * grows out of the tour or the button (FLIP), with the demo in an iframe.
 */
export function StuccoDemo({
  text,
  devices,
  deviceLabel,
}: {
  text: StuccoCopy["demo"];
  devices: Record<StuccoDevice, string>;
  deviceLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<StuccoDevice>("desktop");
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const origin = useRef<DOMRect | null>(null);
  const closing = useRef(false);
  const enter = useRef<Animation | null>(null);
  const exit = useRef<Animation | null>(null);

  const show = useCallback(() => {
    const stage = document.querySelector(".sc-stage");
    origin.current =
      (inView(stage) ? stage : trigger.current)?.getBoundingClientRect() ??
      null;
    closing.current = false;
    setOpen(true);
  }, []);

  /** Leaves the open state; safe to reach twice (the dialog's own close event). */
  const finish = useCallback(() => {
    exit.current?.cancel();
    exit.current = null;
    if (dialog.current?.open) dialog.current.close();
    document.documentElement.style.overflow = "";
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
    if (location.hash === "#demo")
      history.replaceState(
        history.state,
        "",
        location.pathname + location.search,
      );
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    // Measures the frame at rest, even if it is still growing.
    enter.current?.cancel();
    const element = frame.current;
    const from = origin.current;
    if (prefersReducedMotion() || !element || !from || !element.animate)
      return finish();
    backdrop.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: CLOSE_MS - 40,
      fill: "forwards",
    });
    exit.current = element.animate(
      [
        { transformOrigin: "0 0", transform: "none", opacity: 1 },
        {
          transformOrigin: "0 0",
          transform: flip(from, element.getBoundingClientRect()),
          opacity: 0.4,
        },
      ],
      {
        duration: CLOSE_MS,
        easing: "cubic-bezier(.5,0,.75,0)",
        fill: "forwards",
      },
    );
    exit.current.onfinish = finish;
  }, [finish]);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!open || !element || element.open) return;
    element.showModal();
    // The dialog traps focus but document listeners still run; without this the
    // site's search shortcuts would navigate away from behind the layer.
    element.addEventListener("keydown", (event) => {
      if (
        event.key === "/" ||
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))
      )
        event.stopPropagation();
    });
    document.documentElement.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const box = frame.current;
    const from = origin.current;
    if (prefersReducedMotion() || !box || !from || !box.animate) return;
    enter.current = box.animate(
      [
        {
          transformOrigin: "0 0",
          transform: flip(from, box.getBoundingClientRect()),
          borderRadius: "24px",
        },
        { transformOrigin: "0 0", transform: "none", borderRadius: "14px" },
      ],
      { duration: OPEN_MS, easing: "cubic-bezier(.3,.7,.2,1)" },
    );
  }, [open]);

  // A shared link with #demo opens the layer once the page has settled.
  useEffect(() => {
    if (location.hash !== "#demo") return;
    const timer = setTimeout(show, 450);
    return () => clearTimeout(timer);
  }, [show]);

  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  /** Tab from the toolbar's first control goes back into the demo. */
  const onDialogKey = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab" || !event.shiftKey || !frame.current) return;
    if (
      document.activeElement === focusable(frame.current, "button, a[href]")[0]
    ) {
      event.preventDefault();
      const view = iframe.current?.contentWindow;
      if (view && isSameOrigin(view)) {
        view.focus();
        focusable(view.document, demoControls).at(-1)?.focus();
      } else iframe.current?.focus();
    }
  };

  /** Each page the demo loads is a new window, so this runs on every load. */
  const onFrameLoad = () => {
    const view = iframe.current?.contentWindow;
    // A failed load leaves a browser error page, which is cross-origin.
    if (!view || !isSameOrigin(view)) return;
    // Capture runs before the demo's own handler, while its menu is still open:
    // Esc then only closes that menu, as it does in a tab of its own.
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const menuOpen = view.document.querySelector(".menu-open");
        return menuOpen ? undefined : close();
      }
      if (event.key !== "Tab" || !frame.current) return;
      const items = focusable(view.document, demoControls);
      const edge = event.shiftKey ? items[0] : items.at(-1);
      if (view.document.activeElement !== edge) return;
      event.preventDefault();
      if (event.shiftKey) closeButton.current?.focus();
      else focusable(frame.current, "button, a[href]")[0]?.focus();
    };
    view.addEventListener("keydown", listener, true);
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="sc-demo"
        aria-haspopup="dialog"
        data-sound="open"
        onClick={show}
      >
        {text.open}
        <span className="sc-ar" aria-hidden="true">
          ↗
        </span>
      </button>
      {open
        ? createPortal(
            <dialog
              ref={dialog}
              className="dm"
              role="dialog"
              aria-modal="true"
              aria-label={text.label}
              onCancel={(event) => {
                event.preventDefault();
                close();
              }}
              onClose={finish}
              onKeyDown={onDialogKey}
            >
              <div ref={backdrop} className="dm-bg" onClick={close} />
              <div ref={frame} className={`dm-frame is-${device}`}>
                <div className="dm-bar">
                  <span className="dm-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="dm-url">raioviajante.com{DEMO}</span>
                  <div className="dm-seg" role="group" aria-label={deviceLabel}>
                    {(["desktop", "mobile"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={device === value}
                        data-sound="tab"
                        onClick={() => setDevice(value)}
                      >
                        {devices[value]}
                      </button>
                    ))}
                  </div>
                  <a
                    className="dm-btn"
                    href={DEMO}
                    target="_blank"
                    rel="noopener"
                    data-sound="nav"
                  >
                    {text.newTab}
                    <span aria-hidden="true">↗</span>
                  </a>
                  <button
                    ref={closeButton}
                    type="button"
                    className="dm-x"
                    aria-label={text.close}
                    data-sound="click"
                    onClick={close}
                  >
                    ×
                  </button>
                </div>
                <div className="dm-view">
                  <span className="dm-load">{text.loading}</span>
                  <iframe
                    ref={iframe}
                    src={DEMO}
                    title={text.label}
                    onLoad={onFrameLoad}
                  />
                </div>
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}
