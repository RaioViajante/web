import { Fragment } from "react";
import { Art, art } from "./art";
import { SiteLink, type LinkComponent } from "./link";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";
import { SITES, type SiteId } from "../../../site/sites";
import { catalogFor } from "../catalog";
import { searchPagePath } from "../search/locale";

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
  locale,
  scope,
  terms,
  hidden = false,
}: {
  locale: LocaleId;
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
      {catalogFor(locale).search.tryPrefix}{" "}
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
            {last
              ? ""
              : index === terms.length - 2
                ? ` ${catalogFor(locale).search.or} `
                : " "}
          </Fragment>
        );
      })}
    </p>
  );
}

export interface SearchEntry {
  site: SiteId;
  /** The index's locale: every production producer publishes it (#42) and readers require it. */
  locale: LocaleId;
  /** Stable work identity for content entries such as Dump posts. */
  contentId?: string;
  title: string;
  href: string;
  description: string;
  number?: string;
  date?: string;
  body?: string;
}

export function SearchNavItem({
  number,
  current = false,
  site,
  locale = DEFAULT_LOCALE,
  href = site ? searchPagePath(site, locale) : "/search",
  label = catalogFor(locale).search.navLabel,
  linkComponent,
}: {
  number: string;
  current?: boolean;
  /** With `site`, the default `href` is that host's search page in `locale`. */
  site?: SiteId;
  locale?: LocaleId;
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

export function SearchPage({
  site,
  locale,
}: {
  site: SiteId;
  /** The rendered locale: the route states it, the client never infers it. */
  locale: LocaleId;
}) {
  const { search } = catalogFor(locale);
  return (
    <section
      className="rv-search-page"
      data-search-page
      data-search-site={site}
      data-search-locale={locale}
    >
      <header className="rv-search-page__header">
        <p className="rv-label">{search.eyebrow}</p>
        <h1>{search.heading}</h1>
        <div className="rv-ask">
          <Art
            name="searchCharacter"
            alt={search.characterAlt}
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
            {search.prompts[site]}
          </p>
        </div>
      </header>
      <label className="rv-label" htmlFor="rv-search-input">
        {search.inputLabel}
      </label>
      <input
        id="rv-search-input"
        className="rv-search-input"
        type="search"
        autoComplete="off"
        placeholder={search.placeholder}
        data-search-input
        data-sound="typing"
      />
      <div
        className="rv-search-scope"
        role="group"
        aria-label={search.scopeAria}
      >
        <button
          type="button"
          data-search-scope="site"
          aria-pressed="true"
          data-sound="tab"
        >
          {search.thisSite}
        </button>
        <span aria-hidden="true"> · </span>
        <button
          type="button"
          data-search-scope="everywhere"
          aria-pressed="false"
          data-sound="tab"
        >
          {search.everywhere}
        </button>
      </div>
      <div data-search-results aria-live="polite" />
      <p className="rv-search-note" data-search-note role="status" hidden />
      <div className="rv-search-empty" data-search-empty hidden>
        <Art
          name="searchNotFound"
          alt={search.emptyArtAlt}
          width={180}
          height={180}
        />
        <p>{search.empty}</p>
        <Suggestions locale={locale} scope="site" terms={SUGGESTIONS[site]} />
        <Suggestions
          locale={locale}
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
