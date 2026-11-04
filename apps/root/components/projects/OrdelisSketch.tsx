"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectArtCopy } from "../../lib/projects";

type Review = "waiting" | "approved" | "returned";

/**
 * The review step Ordelis plans: agents finish a task and a person approves
 * it or sends it back. A sketch of the intended workflow, played locally; the
 * Ordelis desktop cannot run agents yet, and the sketch says so.
 */
export function OrdelisSketch({
  label,
  text,
}: {
  label: string;
  text: ProjectArtCopy["ordelis"];
}) {
  const [review, setReview] = useState<Review>("waiting");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  const decide = (next: Exclude<Review, "waiting">) => {
    clearTimeout(reset.current);
    setReview(next);
    reset.current = setTimeout(
      () => setReview("waiting"),
      next === "approved" ? 5200 : 3600,
    );
  };

  const agentStatus = {
    waiting: [text.implementing, text.writingTests],
    approved: [text.done, text.done],
    returned: [text.revising, text.revising],
  }[review];
  const message = {
    waiting: text.waiting,
    approved: text.approved,
    returned: text.returned,
  }[review];
  const done = review === "approved";

  return (
    <div
      className="sk sk--ordelis"
      data-review={review}
      role="group"
      aria-label={label}
    >
      <svg className="od-dots" aria-hidden="true">
        <defs>
          <pattern
            id="ordelis-dots"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ordelis-dots)" />
      </svg>
      <span className="od-note">{text.note}</span>
      <svg
        className="od-links"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M30 40 C 33 40, 32 27, 36 27" />
        <path d="M30 40 C 33 40, 32 48, 36 48" />
        <path className="is-quiet" d="M30 40 C 33 40, 32 69, 36 69" />
        <path d="M65 27 C 68 27, 67 28, 70.5 28" />
        <path d="M65 48 C 68 48, 67 32, 70.5 32" />
      </svg>
      <div className="od-grid">
        <div className="od-col">
          <span className="od-label">{text.task}</span>
          <div className="od-card">
            <span className="od-id">#128</span>
            <p className="od-title">{text.taskTitle}</p>
            <ul className="od-steps">
              <li className="is-done">{text.plan}</li>
              <li className={done ? "is-done" : "is-now"}>{text.implement}</li>
              <li className={done ? "is-done" : undefined}>{text.test}</li>
            </ul>
          </div>
        </div>
        <div className="od-col">
          <span className="od-label">{text.agents}</span>
          {(["Claude Code", "Codex"] as const).map((agent, index) => (
            <div key={agent} className={`od-agent${index ? " is-second" : ""}`}>
              <i aria-hidden="true">{index ? "Cx" : "CC"}</i>
              <span>
                <b>{agent}</b>
                <span className="od-agent__status">{agentStatus[index]}</span>
              </span>
              <span className="od-progress" aria-hidden="true">
                <span />
              </span>
            </div>
          ))}
          <div className="od-agent is-open" aria-hidden="true">
            <i>+</i>
            <span>
              <b>{text.another}</b>
              <span className="od-agent__status">{text.anotherNote}</span>
            </span>
          </div>
        </div>
        <div className="od-col">
          <span className="od-label">{text.review}</span>
          <div className="od-card">
            <span className="od-diff">
              <span className="is-added">+142</span>{" "}
              <span className="is-removed">−38</span> · {text.files}
            </span>
            <ul className="od-checks">
              <li>
                <span aria-hidden="true">✓</span>
                {text.testsPassing}
              </li>
              <li>
                <span aria-hidden="true">✓</span>
                {text.lintClean}
              </li>
              <li className="is-note">
                <span aria-hidden="true">•</span>
                {text.openComment}
              </li>
            </ul>
          </div>
          <div className="od-card od-you">
            <span className="od-who">
              <span className="od-who__face" aria-hidden="true" />
              {text.you}
            </span>
            <p className="od-message" aria-live="polite">
              {message}
            </p>
            <div className="od-buttons">
              <button
                type="button"
                className="od-approve"
                data-sound="click"
                onClick={() => decide("approved")}
              >
                {text.approve}
              </button>
              <button
                type="button"
                className="od-return"
                data-sound="click"
                onClick={() => decide("returned")}
              >
                {text.requestChanges}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
