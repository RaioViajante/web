"use client";

import { useState, type ReactNode } from "react";
import { countLabel } from "../../lib/count-label";
import type { ProjectCategory } from "../../lib/projects";

type Filter = ProjectCategory | "all";

/**
 * The catalog's filter: buttons that show one kind of project at a time. The
 * tiles are server-rendered; without JavaScript every tile stays visible and
 * the buttons do nothing.
 */
export function ProjectCatalog({
  items,
  filters,
  label,
  countOne,
  countOther,
}: {
  items: { id: string; category: ProjectCategory; tile: ReactNode }[];
  filters: { value: Filter; label: string }[];
  label: string;
  countOne: string;
  countOther: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (value: Filter) =>
    value === "all"
      ? items.length
      : items.filter((item) => item.category === value).length;
  const shown = count(filter);
  return (
    <>
      <div className="pj-filters">
        <div className="pj-filters__group" role="group" aria-label={label}>
          {filters.map(({ value, label: name }) => (
            <button
              key={value}
              type="button"
              className="pj-filter"
              aria-pressed={filter === value}
              data-sound="click"
              onClick={() => setFilter(value)}
            >
              {name}
              <span className="pj-filter__count">{count(value)}</span>
            </button>
          ))}
        </div>
        {/* The filter's name is part of the message, so changing between two
            kinds with the same count is still announced. */}
        <p className="pj-filters__shown" aria-live="polite">
          {countLabel({ one: countOne, other: countOther }, shown)}
          {filter === "all" ? null : (
            <span className="rv-sr-only">
              {" "}
              · {filters.find(({ value }) => value === filter)?.label}
            </span>
          )}
        </p>
      </div>
      <div className="pj-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="pj-grid__item"
            hidden={filter !== "all" && item.category !== filter}
          >
            {item.tile}
          </div>
        ))}
      </div>
    </>
  );
}
