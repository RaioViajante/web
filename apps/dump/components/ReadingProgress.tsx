"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function update() {
      const remaining =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(remaining > 0 ? Math.min(1, window.scrollY / remaining) : 1);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div
      className="reading-progress"
      style={{ width: `${progress * 100}%` }}
      aria-hidden="true"
    />
  );
}
