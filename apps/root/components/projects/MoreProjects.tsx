"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * The projects grid on /projects: the first cards always, the rest behind a
 * button that shows or hides them in place. Without JavaScript the rest stay
 * hidden; "View all projects" below links every project.
 */
export function MoreProjects({
  first,
  rest,
  more,
  less,
}: {
  first: ReactNode[];
  rest: ReactNode[];
  more: string;
  less: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <div className="pj-pks" id={id}>
        {first}
        {rest.map((card, index) => (
          <div key={index} className="pj-pks__more" hidden={!open}>
            {card}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="pj-toggle"
        aria-expanded={open}
        aria-controls={id}
        data-sound="click"
        onClick={() => setOpen(!open)}
      >
        <span>{open ? less : more}</span>
        <span className="pj-toggle__sign" aria-hidden="true">
          <i />
          <i className="is-vertical" />
        </span>
      </button>
    </>
  );
}
