"use client";

import { useEffect, useRef } from "react";

// Repository configuration for the giscus GitHub Discussions backend. These
// are the real, retrieved repo/category identifiers for RaioViajante/web —
// see docs/comments.md for how they were obtained and how to re-derive them.
const REPO = "RaioViajante/web";
const REPO_ID = "R_kgDOUu8oYA";
const CATEGORY = "Comments";
const CATEGORY_ID = "DIC_kwDOUu8oYM4DGx0J";

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
  script.setAttribute("data-theme", `${window.location.origin}/giscus.css`);
  script.setAttribute("data-lang", "en");

  container.appendChild(script);
}

/**
 * Article comments, backed by giscus (GitHub Discussions). Isolated client
 * boundary: mounted only from `PostArticle`, deferred until scrolled near,
 * with a custom editorial theme. Everything else on the article page stays
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

  return <div ref={containerRef} className="comments" />;
}
