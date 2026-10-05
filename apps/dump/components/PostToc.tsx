"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Heading = { id: string; number: string; title: string };

export function PostToc({ headings }: { headings: Heading[] }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setSlot(document.getElementById("post-toc-slot")),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  if (!headings.length) return null;
  const toc = (
    <nav className="post-toc" aria-label="On this page">
      <strong>On this page</strong>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} data-sound="nav">
              {heading.number}. {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
  return slot ? createPortal(toc, slot) : toc;
}
