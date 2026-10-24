import type { ReactNode } from "react";
import { SiteLink, type LinkComponent } from "./link";
import { LanguageControl } from "./lang";
import { catalogFor } from "../catalog";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localizedPath,
  participates,
  type LocaleId,
} from "../../../site/locales";
import { CONTACT, SITES, type SiteId } from "../../../site/sites";
import { ownerLocation } from "../../../site/owner-location";

export interface NavItem {
  label: string;
  href: string;
  /** Overrides the automatic `00.` numbering, for example `001` on lab. */
  number?: string;
  /** A page that sits under the previous one (`01.1 cli reference`). */
  sub?: boolean;
}

export interface NavGroupProps {
  label: string;
  items: NavItem[];
  /** The item whose `href` equals this value is current. */
  current?: string;
  ariaLabel?: string;
  /** A stable hook for styles, independent of the localized label. */
  nav?: string;
  /** Rendered inside the group after the items (the search menu item). */
  extra?: ReactNode;
  /**
   * Collapses the items behind a native disclosure on small screens; wider
   * screens always show them under the plain label ("on this page").
   */
  collapsible?: boolean;
  linkComponent?: LinkComponent;
}

const pad = (index: number) => `${String(index).padStart(2, "0")}.`;

export function NavGroup({
  label,
  items,
  current,
  ariaLabel,
  nav,
  extra,
  collapsible,
  linkComponent,
}: NavGroupProps) {
  const links = items.map((item, index) => (
    <SiteLink
      key={item.href}
      linkComponent={linkComponent}
      href={item.href}
      data-sound="nav"
      className={item.sub ? "rv-nav__sub" : undefined}
      aria-current={item.href === current ? "page" : undefined}
    >
      <span className="rv-nav__num">{item.number ?? pad(index)}</span>
      <span>{item.label}</span>
    </SiteLink>
  ));
  return (
    <nav
      className="rv-nav"
      aria-label={ariaLabel ?? label.toLowerCase()}
      data-nav={nav}
    >
      {collapsible ? (
        <>
          <div className="rv-label rv-nav__heading">{label}</div>
          <details className="rv-nav__details">
            <summary className="rv-label rv-nav__summary">
              {label} <span aria-hidden="true">·</span> {items.length}
            </summary>
            {links}
          </details>
        </>
      ) : (
        <>
          <div className="rv-label">{label}</div>
          {links}
        </>
      )}
      {extra}
    </nav>
  );
}

/** The sound button. Its words come from the page locale's catalog and are repainted from it, never from English. */
export function SoundToggle({ locale }: { locale: LocaleId }) {
  const { sound } = catalogFor(locale);
  return (
    <button
      type="button"
      data-sound-toggle=""
      data-sound-locale={locale}
      data-sound="toggle"
      aria-pressed="false"
      aria-label={sound.aria(false)}
    >
      <span className="rv-utility__label">{sound.label}</span>{" "}
      <span className="rv-sound__value" aria-hidden="true">
        {sound.off}
      </span>
    </button>
  );
}

/** The owner's configured local time; shared behavior replaces the stable placeholder. */
export function OwnerClock({ locale }: { locale: LocaleId }) {
  const label = ownerLocation.label;
  const accessibleLabel = catalogFor(locale).clock.aria(label);
  return (
    <div className="rv-clock">
      <span className="rv-utility__label" aria-hidden="true">
        {label}
      </span>
      <span className="rv-sr-only">{accessibleLabel}: </span>
      <time className="rv-utility__value" data-owner-clock="">
        --:--
      </time>
    </div>
  );
}

export interface FooterProps {
  site: SiteId;
  /** The rendered locale: the language of the shared labels. */
  locale: LocaleId;
  /** This site's own legal pages. */
  termsHref?: string;
  privacyHref?: string;
  /**
   * The language of a legal page when it differs from `locale` (a Portuguese
   * page linking English legal text). The link then names that language and
   * carries `hreflang`.
   */
  termsLocale?: LocaleId;
  privacyLocale?: LocaleId;
  /** Participation lookup for cross-site destinations; the registry by default. */
  isParticipating?: (site: SiteId, locale: LocaleId) => boolean;
  linkComponent?: LinkComponent;
}

/**
 * Where a footer link to another RaioViajante host goes. A localized
 * destination needs the rollout to permit it: the rendered app AND the target
 * host both participate in the locale (publish before advertise). Otherwise it
 * is the English public destination. Nothing is probed.
 */
export function footerDestination(
  currentSite: SiteId,
  target: (typeof SITES)[number],
  locale: LocaleId,
  isParticipating: (site: SiteId, locale: LocaleId) => boolean = participates,
): { locale: LocaleId; href: string } {
  const localized =
    locale !== DEFAULT_LOCALE &&
    isParticipating(currentSite, locale) &&
    isParticipating(target.id, locale);
  const destination: LocaleId = localized ? locale : DEFAULT_LOCALE;
  return {
    locale: destination,
    href: localized
      ? new URL(localizedPath(target.id, destination, "/"), target.href).href
      : target.href,
  };
}

export function Footer({
  site,
  locale,
  termsHref = "/terms",
  privacyHref = "/privacy",
  termsLocale = locale,
  privacyLocale = locale,
  isParticipating,
  linkComponent,
}: FooterProps) {
  const { footer, lang } = catalogFor(locale);
  const legal = (href: string, label: string, destination: LocaleId) => (
    <SiteLink
      // A Next layout can survive client navigation. Crossing languages must
      // reload the document so its root <html lang> is rendered afresh.
      linkComponent={destination === locale ? linkComponent : undefined}
      href={href}
      data-sound="nav"
      {...(destination !== locale
        ? { hrefLang: LOCALES[destination].hreflang }
        : {})}
    >
      {label}
      {destination !== locale
        ? ` (${footer.inLanguage(lang.names[destination])})`
        : ""}
    </SiteLink>
  );
  return (
    <footer className="rv-footer">
      <nav aria-label={footer.sitesAria}>
        {SITES.map((item, index) => {
          const to = footerDestination(site, item, locale, isParticipating);
          return (
            <span key={item.id}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              <a
                href={to.href}
                data-sound="nav"
                {...(locale !== DEFAULT_LOCALE
                  ? { hrefLang: LOCALES[to.locale].hreflang }
                  : {})}
              >
                {item.label}
                {to.locale !== locale
                  ? ` (${footer.inLanguage(lang.names[to.locale])})`
                  : ""}
              </a>
            </span>
          );
        })}
      </nav>
      <div>
        <a href={`mailto:${CONTACT.email}`} data-sound="nav">
          {CONTACT.email}
        </a>
      </div>
      <div>CNPJ: {CONTACT.cnpj}</div>
      <nav aria-label={footer.legalAria}>
        {legal(termsHref, footer.terms, termsLocale)}
        <span aria-hidden="true"> · </span>
        {legal(privacyHref, footer.privacy, privacyLocale)}
      </nav>
    </footer>
  );
}

export interface ShellProps extends FooterProps {
  /** PAGES. */
  pages: NavItem[];
  currentPage?: string;
  /** Rendered last inside PAGES: the search menu item. */
  pagesExtra?: ReactNode;
  /** ON THIS PAGE. */
  toc?: NavItem[];
  currentToc?: string;
  /** Lab: EXPERIMENTS. */
  experiments?: NavItem[];
  currentExperiment?: string;
  /** The `LANG` facts the app knows: this page's real counterpart, or that this is the search page. */
  language?: { counterpart?: string; search?: boolean };
  children: ReactNode;
}

/**
 * The frame every page shares: sidebar, sound toggle, 740px column, footer.
 * Wrap page content in it and pass only what differs per site.
 */
export function Shell({
  pages,
  currentPage,
  pagesExtra,
  toc,
  currentToc,
  experiments,
  currentExperiment,
  language,
  children,
  ...footer
}: ShellProps) {
  const { linkComponent, locale, site } = footer;
  const { shell } = catalogFor(locale);
  return (
    <>
      <a className="rv-skip" href="#main">
        {shell.skip}
      </a>
      <div className="rv-shell">
        <header className="rv-sound">
          <OwnerClock locale={locale} />
          <SoundToggle locale={locale} />
          <LanguageControl site={site} locale={locale} {...language} />
        </header>
        <aside className="rv-sidebar">
          <NavGroup
            label={shell.pages}
            ariaLabel={shell.pagesAria}
            nav="pages"
            items={pages}
            current={currentPage}
            extra={pagesExtra}
            linkComponent={linkComponent}
          />
          {toc?.length ? (
            <NavGroup
              label={shell.onThisPage}
              items={toc}
              current={currentToc}
              ariaLabel={shell.onThisPageAria}
              collapsible
              linkComponent={linkComponent}
            />
          ) : null}
          {experiments?.length ? (
            <NavGroup
              label={shell.experiments}
              ariaLabel={shell.experimentsAria}
              items={experiments}
              current={currentExperiment}
              linkComponent={linkComponent}
            />
          ) : null}
        </aside>
        <div className="rv-main">
          <div className="rv-column">
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer {...footer} />
          </div>
        </div>
      </div>
    </>
  );
}
