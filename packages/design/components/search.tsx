import { Fragment } from "react";
import { Art, art } from "./art";
import { SiteLink, type LinkComponent } from "./link";
import type { SiteId } from "./sites";

export interface SearchEntry {
  site: SiteId;
  title: string;
  href: string;
  description: string;
  number?: string;
  date?: string;
  body?: string;
}

const prompts: Record<SiteId, string> = {
  root: "what are you looking for?",
  dump: "what are you curious about?",
  docs: "what do you need to look up?",
  lab: "what do you want to poke at?",
};

export function SearchNavItem({
  number,
  current = false,
  href = "/search",
  label = "search",
  linkComponent,
}: {
  number: string;
  current?: boolean;
  href?: string;
  label?: string;
  linkComponent?: LinkComponent;
}) {
  return (
    <SiteLink
      linkComponent={linkComponent}
      href={href}
      className="rv-search"
      aria-current={current ? "page" : undefined}
      aria-keyshortcuts="Meta+K Control+K /"
      data-sound="open"
    >
      <span className="rv-search__num">{number}</span>
      <span>{label}</span>
      <span className="rv-search__dots" aria-hidden="true" />
      <span className="rv-peek" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- shared static asset */}
        <img src={art.searchHeadStatic.src} width="30" height="30" alt="" />
        <span className="rv-peek__q">?</span>
      </span>
      <span className="rv-search__key" data-search-key>
        ⌘K
      </span>
    </SiteLink>
  );
}

export function SearchPage({ site }: { site: SiteId }) {
  return (
    <section
      className="rv-search-page"
      data-search-page
      data-search-site={site}
    >
      <header className="rv-search-page__header">
        <p className="rv-label">ASK RAIOVIAJANTE</p>
        <h1>search</h1>
        <div className="rv-ask">
          <Art
            name="searchCharacter"
            alt="RaioViajante wondering, with a hand on his chin"
            width={150}
            height={150}
            priority
          />
          <p
            className="rv-bubble"
            role="status"
            aria-live="polite"
            data-search-bubble
          >
            {prompts[site]}
          </p>
        </div>
      </header>
      <label className="rv-label" htmlFor="rv-search-input">
        SEARCH
      </label>
      <input
        id="rv-search-input"
        className="rv-search-input"
        type="search"
        autoComplete="off"
        placeholder="type to search"
        data-search-input
        data-sound="typing"
      />
      <div className="rv-search-scope" role="group" aria-label="Search scope">
        <button
          type="button"
          data-search-scope="site"
          aria-pressed="true"
          data-sound="tab"
        >
          this site
        </button>
        <span aria-hidden="true"> · </span>
        <button
          type="button"
          data-search-scope="everywhere"
          aria-pressed="false"
          data-sound="tab"
        >
          everywhere
        </button>
      </div>
      <div data-search-results aria-live="polite" />
      <p className="rv-search-note" data-search-note role="status" hidden />
      <div className="rv-search-empty" data-search-empty hidden>
        <Art
          name="searchNotFound"
          alt="RaioViajante and a cat looking through a pile of notes"
          width={180}
          height={180}
        />
        <p>maybe I haven&apos;t built it yet.</p>
        <div
          className="rv-search-suggestions"
          role="group"
          aria-label="Try searching for"
        >
          <span className="rv-label" aria-hidden="true">
            try
          </span>
          {(["sweep", "orbit", "design", "lab"] as const).map((term, index) => (
            <Fragment key={term}>
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <button
                type="button"
                data-search-suggestion={term}
                data-sound="tab"
              >
                {term}
              </button>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
