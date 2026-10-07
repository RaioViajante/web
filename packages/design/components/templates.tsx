import type { ReactNode } from "react";
import { Art } from "./art";
import { type LinkComponent } from "./link";
import { LeaderRow, PageHeader, Section } from "./page";
import { siteById, type SiteId } from "../../../site/sites";

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
  inShort,
  sections,
  lastUpdated,
}: {
  site: SiteId;
  title: "Terms of Use" | "Privacy Policy";
  inShort: { label: string; value: ReactNode }[];
  sections: LegalSection[];
  /** Omit until the date is known; nothing renders in its place. */
  lastUpdated?: string;
}) {
  const host = siteById(site).label;
  return (
    <>
      <PageHeader
        label="LEGAL"
        title={title}
        line={`${host} · the short version first`}
        meta={[
          ...(lastUpdated ? [`last updated ${lastUpdated}`] : []),
          "applies to this site",
        ]}
      />
      <Section number="00." title="In short">
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
}

/**
 * 404 content, one design for all four sites. Each site passes its voice and
 * its links; the requested path is filled in by the shared behavior script.
 */
export function NotFoundPage({
  site,
  line,
  tryInstead,
  ask,
  linkComponent,
}: {
  site: SiteId;
  line: string;
  tryInstead: TryInstead[];
  /** "ask RaioViajante" row, from the search menu item component. */
  ask?: ReactNode;
  linkComponent?: LinkComponent;
}) {
  const host = siteById(site).label;
  return (
    <>
      <PageHeader
        label="404 · NOT FOUND"
        title="I looked everywhere."
        line={line}
      >
        <Art
          name="notFound"
          alt="RaioViajante shrugging, surrounded by question marks, under a sign that reads 404 page not found"
          width={300}
          className="rv-404-art"
        />
      </PageHeader>
      <div className="block rv-requested">
        <div className="block__meta">
          <span className="block__file">requested</span>
          <span>not found</span>
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
      <Section number="00." title="Try instead">
        {tryInstead.map((row) => (
          <LeaderRow
            key={row.href}
            label={row.label}
            value={row.value}
            href={row.href}
            linkComponent={linkComponent}
          />
        ))}
      </Section>
      {ask ? (
        <Section number="00.1" title="Or just ask">
          {ask}
        </Section>
      ) : null}
    </>
  );
}
