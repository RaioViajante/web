"use client";

import { useState, type ReactNode } from "react";

/**
 * The Refrain sketch's one piece of state: whether the record plays. The
 * drawing itself is server-rendered and passed in; this only flips
 * `data-playing`, which the CSS turns into a spinning record, a lowered arm,
 * filled stars and rising notes.
 */
export function RefrainStage({
  label,
  play,
  stop,
  record,
  disc,
  children,
}: {
  label: string;
  play: string;
  stop: string;
  record: string;
  disc: ReactNode;
  children: ReactNode;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      className="sk sk--refrain"
      data-playing={playing || undefined}
      role="group"
      aria-label={label}
    >
      {children}
      <button
        type="button"
        className="rf-record"
        data-sound="click"
        onClick={() => setPlaying(!playing)}
      >
        {disc}
        <span className="rf-play">
          <span className="rf-play__mark" aria-hidden="true" />
          {playing ? stop : play}
          <span className="rv-sr-only"> {record}</span>
        </span>
      </button>
    </div>
  );
}
