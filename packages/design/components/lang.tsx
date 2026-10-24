import {
  LOCALE_IDS,
  LOCALES,
  localizedPath,
  participates,
  type LocaleId,
} from "../../../site/locales";
import type { SiteId } from "../../../site/sites";
import { catalogFor } from "../catalog";
import { searchLocaleHref } from "../search/locale";

/**
 * The compact identity is fixed in every locale: `LANG EN`, `LANG PT`
 * (docs/i18n.md, "Language selector"). It is a control name, not translatable
 * copy; the language itself is the registry's compact label.
 */
const LANG_TOKEN = "LANG";

export interface LanguageControlProps {
  site: SiteId;
  /** The rendered locale; the route states it. */
  locale: LocaleId;
  /**
   * The real, public counterpart of this page in the other locale, supplied by
   * the app's route or content record. It is never derived from the path.
   */
  counterpart?: string;
  /** This is the search page: the choice is the other locale's search page, carrying `q` only. */
  search?: boolean;
  /** Participation lookup; the registry by default. */
  isParticipating?: (site: SiteId, locale: LocaleId) => boolean;
}

/**
 * `LANG`: navigation, not locale state (docs/i18n.md, "Language selector").
 * Participation is checked before counterpart availability: if the current or
 * the offered locale does not participate, this is a noninteractive status.
 * Otherwise it is a plain link to the counterpart (or the other search page),
 * or a native disclosure that says the page is missing and links the other
 * locale's home. Static markup, no script needed, nothing stored.
 */
export function LanguageControl({
  site,
  locale,
  counterpart,
  search = false,
  isParticipating = participates,
}: LanguageControlProps) {
  const catalog = catalogFor(locale);
  const current = LOCALES[locale];
  const target = LOCALE_IDS.find((id) => id !== locale);
  const compact = (
    <span>
      {LANG_TOKEN}{" "}
      <span className="rv-utility__value" lang={current.htmlLang}>
        {current.label}
      </span>
    </span>
  );
  if (
    !target ||
    !isParticipating(site, locale) ||
    !isParticipating(site, target)
  )
    return (
      <div className="rv-lang" data-lang-state="status">
        <span aria-hidden="true">{compact}</span>
        <span className="rv-sr-only">
          {catalog.lang.statusAria(current.name)}
        </span>
      </div>
    );
  const other = LOCALES[target];
  const targetWord = catalog.lang.names[target];
  const searchHref = search
    ? searchLocaleHref(site, locale, target, "", isParticipating)
    : undefined;
  const href = searchHref ?? counterpart;
  return (
    <nav
      className="rv-lang"
      aria-label={catalog.lang.navAria(current.name)}
      data-lang-state={href ? "link" : "disclosure"}
    >
      {href ? (
        <a
          href={href}
          hrefLang={other.hreflang}
          aria-label={catalog.lang.switchAria(current.name, targetWord)}
          data-sound="nav"
          {...(search ? { "data-lang-search": "" } : {})}
        >
          {compact}
        </a>
      ) : (
        <details className="rv-lang__details">
          <summary
            aria-label={catalog.lang.availabilityAria(current.name, targetWord)}
          >
            {compact}
          </summary>
          <div className="rv-lang__panel">
            <p>{catalog.lang.unavailable(targetWord)}</p>
            <a
              href={localizedPath(site, target, "/")}
              hrefLang={other.hreflang}
              data-sound="nav"
            >
              {catalog.lang.home(targetWord)}
            </a>
          </div>
        </details>
      )}
    </nav>
  );
}
