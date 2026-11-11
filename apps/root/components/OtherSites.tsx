import { Section } from "@raioviajante/design/components";
import type { OtherSite } from "../lib/this-site";

/**
 * The This site sections about Dump, Docs and Lab, numbered from `05.2`, in
 * either language. `englishNote` names a link that falls back to English.
 */
export function OtherSites({
  sites,
  englishNote,
}: {
  sites: readonly OtherSite[];
  englishNote?: string;
}) {
  return sites.map((site, index) => (
    <Section
      key={site.id}
      number={`05.${index + 2}`}
      title={site.title}
      id={`${site.id}-heading`}
    >
      <p>
        <a href={site.link.href} hrefLang={site.link.hrefLang} data-sound="nav">
          {new URL(site.link.href).host}
        </a>
        {englishNote && site.link.hrefLang === "en" ? englishNote : null}{" "}
        {site.holds}
      </p>
      <ul className="rv-dash-list">
        {site.built.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Section>
  ));
}
