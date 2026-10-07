"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// Repository configuration for the giscus GitHub Discussions backend. These
// are the real, retrieved repo/category identifiers for RaioViajante/web —
// see docs/comments.md for how they were obtained and how to re-derive them.
const REPO = "RaioViajante/web";
const REPO_ID = "R_kgDOUu8oYA";
const CATEGORY = "Comments";
const CATEGORY_ID = "DIC_kwDOUu8oYM4DGx0J";

/** Distance below the viewport at which scrolling toward the comments starts loading them. */
const ROOT_MARGIN = "200px";

type Status = "waiting" | "manual" | "loading" | "failed" | "loaded";

function loadGiscus(
  container: HTMLDivElement,
  onLoad: () => void,
  onError: () => void,
) {
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", REPO);
  script.setAttribute("data-repo-id", REPO_ID);
  script.setAttribute("data-category", CATEGORY);
  script.setAttribute("data-category-id", CATEGORY_ID);
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "1");
  script.setAttribute("data-reactions-enabled", "0");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-theme", `${window.location.origin}/giscus.css`);
  script.setAttribute("data-lang", "en");
  script.addEventListener("load", onLoad);
  script.addEventListener("error", onError);

  container.appendChild(script);
}

const MESSAGES: Record<Exclude<Status, "loaded">, string> = {
  waiting:
    "Comments load from giscus (GitHub Discussions) when you scroll to this section.",
  manual:
    "Comments are provided by giscus (GitHub Discussions). Loading them connects to giscus.app and GitHub.",
  loading: "Loading comments…",
  failed: "Comments could not be loaded.",
};

/**
 * Article comments, backed by giscus (GitHub Discussions). Isolated client
 * boundary: mounted only from `PostArticle`. Nothing contacts giscus.app until
 * the section nears the viewport (or, without IntersectionObserver, until the
 * reader presses "Load comments"), and the script is added at most once. The
 * one exception is the return from GitHub sign-in (`?giscus=` in the URL),
 * which loads giscus immediately so it can finish the sign-in.
 */
export function Comments() {
  const mountRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);
  const [phase, setStatus] = useState<Status>("waiting");
  // Server and first client render assume support, so hydration matches.
  const observable = useSyncExternalStore(
    () => () => {},
    () => typeof IntersectionObserver !== "undefined",
    () => true,
  );
  const status: Status = !observable && phase === "waiting" ? "manual" : phase;

  const start = useCallback(() => {
    const node = mountRef.current;
    if (!node || started.current) return;
    started.current = true;
    node.replaceChildren();
    setStatus("loading");
    loadGiscus(
      node,
      () => {
        // The status text unmounts; if the reader was on it, move them into the widget.
        if (document.activeElement === statusRef.current)
          node.querySelector("iframe")?.focus();
        setStatus("loaded");
      },
      () => {
        started.current = false;
        setStatus("failed");
      },
    );
  }, []);

  useEffect(() => {
    const node = mountRef.current;
    if (!node) return;

    // Coming back from GitHub sign-in, giscus has put its session in the URL
    // as `?giscus=`. Only the giscus script reads and removes it, so load it
    // now instead of waiting for the reader to scroll. Nothing here touches
    // the token: giscus handles its own protocol.
    if (new URLSearchParams(window.location.search).has("giscus")) {
      start();
      return () => {
        node.replaceChildren();
        started.current = false;
      };
    }

    // Hydration renders with the server snapshot (observable), so check the real API.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: ROOT_MARGIN },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      node.replaceChildren();
      started.current = false;
    };
  }, [start]);

  return (
    <div className="comments">
      {status !== "loaded" && (
        <p ref={statusRef} role="status" tabIndex={-1}>
          {MESSAGES[status]}
        </p>
      )}
      {(status === "manual" || status === "failed") && (
        <button
          type="button"
          className="rv-btn"
          onClick={() => {
            start();
            // The button unmounts; keep the keyboard position on the status text.
            statusRef.current?.focus();
          }}
        >
          {status === "failed" ? "Try again" : "Load comments"}
        </button>
      )}
      <div ref={mountRef} />
    </div>
  );
}
