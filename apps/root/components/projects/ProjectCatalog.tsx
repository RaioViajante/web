"use client";

import { useState, type ReactNode } from "react";
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
        <p className="pj-filters__shown" aria-live="polite">
          {(shown === 1 ? countOne : countOther).replace(
            "{n}",
            String(shown).padStart(2, "0"),
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
