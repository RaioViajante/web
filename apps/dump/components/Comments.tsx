"use client";

import { useEffect, useRef } from "react";

// Repository configuration for the giscus GitHub Discussions backend. These
// are the real, retrieved repo/category identifiers for RaioViajante/dump —
// see docs/comments.md for how they were obtained and how to re-derive them.
const REPO = "RaioViajante/dump";
const REPO_ID = "R_kgDOUNBnpg";
const CATEGORY = "Comments";
const CATEGORY_ID = "DIC_kwDOUNBnps4DE4Sz";

// Borderless variants read closest to the editorial palette: no boxed card,
// just text and rules matching the surrounding article.
const LIGHT_THEME = "noborder_light";
const DARK_THEME = "noborder_dark";

function currentGiscusTheme(): string {
  return document.documentElement.dataset.theme === "dark"
    ? DARK_THEME
    : LIGHT_THEME;
}

function loadGiscus(container: HTMLDivElement) {
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
  script.setAttribute("data-theme", currentGiscusTheme());
  script.setAttribute("data-lang", "en");

  container.appendChild(script);
}

/**
 * Article comments, backed by giscus (GitHub Discussions). Isolated client
 * boundary: mounted only from `PostArticle`, deferred until scrolled near,
 * and kept in sync with the site's light/dark theme via the official
 * `setConfig` postMessage. Everything else on the article page stays
 * server-rendered.
 */
export function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Defer loading giscus until the comments area nears the viewport, so it
  // never competes with the article for load time. Mounts by DOM
  // manipulation directly rather than React state, since nothing here needs
  // to re-render once loaded.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      loadGiscus(node);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadGiscus(node);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      node.replaceChildren();
    };
  }, []);

  // Live theme sync: forward the site's data-theme changes to the giscus
  // iframe, once mounted, via its official setConfig message. No-op until
  // the iframe exists, so this is safe to observe from mount.
  useEffect(() => {
    function sendTheme() {
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      );
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: currentGiscusTheme() } } },
        "https://giscus.app",
      );
    }

    const observer = new MutationObserver(sendTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <hr className="comments-rule" />
      <div ref={containerRef} className="comments" />
    </>
  );
}
