import type { ReactNode } from "react";
import { Art } from "./art";
import { type LinkComponent } from "./link";
import { LeaderRow, PageHeader, Section } from "./page";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";
import { siteById, type SiteId } from "../../../site/sites";
import { catalogFor } from "../catalog";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

/**
 * Legal page template for Terms of Use and Privacy Policy: "In short"
 * leaders first, then numbered sections. Site-specific sections are passed in.
 */
export function LegalPage({
  site,
  title,
  locale = DEFAULT_LOCALE,
  inShort,
  sections,
  lastUpdated,
}: {
  site: SiteId;
  /** The document title in the page's language (the footer catalog names both). */
  title: string;
  /** The rendered locale: the language of the template's chrome. */
  locale?: LocaleId;
  inShort: { label: string; value: ReactNode }[];
  sections: LegalSection[];
  /** Omit until the date is known; nothing renders in its place. */
  lastUpdated?: string;
}) {
  const host = siteById(site).label;
  const { legal } = catalogFor(locale);
  return (
    <>
      <PageHeader
        label={legal.label}
        title={title}
        line={legal.line(host)}
        meta={[
          ...(lastUpdated ? [legal.updated(lastUpdated)] : []),
          legal.applies,
        ]}
      />
      <Section number="00." title={legal.inShort}>
        {inShort.map((row) => (
          <LeaderRow key={row.label} label={row.label} value={row.value} />
        ))}
      </Section>
      {sections.map((section, index) => (
        <Section
          key={section.title}
          number={`${String(index + 1).padStart(2, "0")}.`}
          title={section.title}
        >
          {section.body}
        </Section>
      ))}
    </>
  );
}

export interface TryInstead {
  label: string;
  value: string;
  href: string;
  /** Language of the destination when it differs from the rendered page. */
  hrefLang?: string;
}

/**
 * 404 content, one design for all four sites. Each site passes its voice and
 * its links; the requested path is filled in by the shared behavior script.
 */
export function NotFoundPage({
  site,
  locale,
  line,
  tryInstead,
  ask,
  linkComponent,
}: {
  site: SiteId;
  /** The rendered locale: the language of the shared 404 copy. */
  locale: LocaleId;
  /** The app's own voice line. */
  line: string;
  tryInstead: TryInstead[];
  /** "ask RaioViajante" row, from the search menu item component. */
  ask?: ReactNode;
  linkComponent?: LinkComponent;
}) {
  const host = siteById(site).label;
  const { notFound } = catalogFor(locale);
  return (
    <>
      <PageHeader label={notFound.label} title={notFound.title} line={line}>
        <Art
          name="notFound"
          alt={notFound.art}
          width={300}
          className="rv-404-art"
        />
      </PageHeader>
      <div className="block rv-requested">
        <div className="block__meta">
          <span className="block__file">{notFound.requested}</span>
          <span>{notFound.requestedState}</span>
        </div>
        <div className="block__body">
          <pre tabIndex={0}>
            <code>
              <span className="line">
                <span>
                  <span className="rv-requested__host">{host}</span>
                  <span className="tok-string" data-requested-path="">
                    /
                  </span>
                </span>
              </span>
            </code>
          </pre>
        </div>
      </div>
      <Section number="00." title={notFound.tryInstead}>
        {tryInstead.map((row) => (
          <LeaderRow
            key={row.href}
            label={row.label}
            value={row.value}
            href={row.href}
            hrefLang={row.hrefLang}
            linkComponent={linkComponent}
          />
        ))}
      </Section>
      {ask ? (
        <Section number="00.1" title={notFound.ask}>
          {ask}
        </Section>
      ) : null}
    </>
  );
}
