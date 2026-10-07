import { Fragment } from "react";
import { Art, art } from "./art";
import { SiteLink, type LinkComponent } from "./link";
import { SITES, type SiteId } from "../../../site/sites";

/** Searches that find something on each site, offered when nothing matched. */
const SUGGESTIONS: Record<SiteId, readonly string[]> = {
  root: ["projects", "setup", "about", "gallery"],
  dump: ["orbit", "assembly", "language", "scheduler"],
  docs: ["sweep", "cli", "tokens", "commits"],
  lab: ["classifier", "boot", "execution"],
};
/** One term that only the site's own index has, used by "everywhere". */
const SIGNATURE: Record<SiteId, string> = {
  root: "setup",
  dump: "assembly",
  docs: "cli",
  lab: "classifier",
};

/** "try a, b or c." with each term as a button that fills the query. */
function Suggestions({
  scope,
  terms,
  hidden = false,
}: {
  scope: "site" | "everywhere";
  terms: readonly string[];
  hidden?: boolean;
}) {
  return (
    <p
      className="rv-search-suggestions"
      data-search-suggestions={scope}
      hidden={hidden}
    >
      try{" "}
      {terms.map((term, index) => {
        const last = index === terms.length - 1;
        // Punctuation stays on the word's line; lines break only at spaces.
        return (
          <Fragment key={term}>
            <span className="rv-search-suggestion">
              <button
                type="button"
                data-search-suggestion={term}
                data-sound="tab"
              >
                {term}
              </button>
              {last ? "." : index < terms.length - 2 ? "," : ""}
            </span>
            {last ? "" : index === terms.length - 2 ? " or " : " "}
          </Fragment>
        );
      })}
    </p>
  );
}

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
        <Suggestions scope="site" terms={SUGGESTIONS[site]} />
        <Suggestions
          scope="everywhere"
          terms={SITES.filter((other) => other.id !== site).map(
            (other) => SIGNATURE[other.id],
          )}
          hidden
        />
      </div>
    </section>
  );
}
