"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Holds the slideshow on photo 01 until 45% of the art is in view. Without
 * JavaScript, or under reduced motion, it simply stays there.
 */
export function StuccoPlay({ children }: { children: ReactNode }) {
  const art = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = art.current;
    if (!element) return;
    const run = () => element.classList.remove("st-wait");
    if (!("IntersectionObserver" in window)) return run();
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={art} className="st-art st-wait" aria-hidden="true">
      {children}
    </div>
  );
}
