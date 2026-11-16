// The About page in either language. The routes in app/ only choose the
// locale.

import Link from "next/link";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import {
  DEFAULT_LOCALE,
  participates,
  type LocaleId,
} from "../../../site/locales";
import { siteOrigins } from "../../../site/sites";
import { aboutCopy, type AboutCopy, type AboutRow } from "../lib/about";
import { projects } from "../lib/projects";
import { ptAbout, ptDocsHome, ptDumpHome, ptLabHome } from "../lib/pt";
import { routes } from "../lib/routes";
import { projectsCopyFor } from "./projects/copy";
import "../app/about/about.css";

/** A destination and the language it is in. */
interface Place {
  href: string;
  hrefLang?: "en" | "pt-BR";
}

/** The sister sites' homes in a locale: localized only where both sites take part. */
function sisterHomes(locale: LocaleId): Record<"dump" | "docs" | "lab", Place> {
  if (locale === DEFAULT_LOCALE)
    return {
      dump: { href: siteOrigins.dump },
      docs: { href: siteOrigins.docs },
      lab: { href: siteOrigins.lab },
    };
  return { dump: ptDumpHome, docs: ptDocsHome, lab: ptLabHome };
}

function rowDestination(row: AboutRow, locale: LocaleId): Place | undefined {
  if (!row.to) return undefined;
  if (row.to === "gallery") return { href: routes.gallery[locale]! };
  if (row.to === "refrain")
    return { href: `${routes.projects[locale]!}#refrain` };
  return sisterHomes(locale)[row.to];
}

/** A leader row; a link when it has a destination, which says when it is in English. */
function Row({
  label,
  value,
  place,
  locale,
  copy,
}: {
  label: string;
  value: string;
  place?: Place;
  locale: LocaleId;
  copy: AboutCopy;
}) {
  const english = locale !== DEFAULT_LOCALE && place?.hrefLang === "en";
  return (
    <LeaderRow
      linkComponent={place?.href.startsWith("/") ? Link : undefined}
      label={english ? `${label}${copy.englishNote}` : label}
      value={value}
      href={place?.href}
      hrefLang={place?.hrefLang}
      newTab={locale}
    />
  );
}

export function AboutPage({ locale }: { locale: LocaleId }) {
  const copy = locale === DEFAULT_LOCALE ? aboutCopy : ptAbout;
  const projectText = projectsCopyFor(locale).projects;
  const homes = sisterHomes(locale);
  // Portuguese posts only while Dump publishes them; otherwise the English
  // ones, said to be in English.
  const localizedPosts =
    locale === DEFAULT_LOCALE || participates("dump", locale);
  const posts = localizedPosts ? copy.writing.posts : aboutCopy.writing.posts;
  const places: { name: string; note: string; place: Place }[] = [
    {
      name: "raioviajante.com",
      note: copy.places.notes.root,
      place: { href: routes.home[locale]! },
    },
    { name: "dump", note: copy.places.notes.dump, place: homes.dump },
    { name: "docs", note: copy.places.notes.docs, place: homes.docs },
    { name: "lab", note: copy.places.notes.lab, place: homes.lab },
  ];
  return (
    <>
      <PageHeader label={copy.label} title={copy.title} line={copy.line}>
        <span className="about-avatar">
          <AvatarCoin label={copy.avatarLabel} />
        </span>
      </PageHeader>

      <Section number="01." title={copy.who.heading} id="about-heading">
        {copy.who.paragraphs.map((text) => (
          <p key={text} className="about-p">
            {text}
          </p>
        ))}
      </Section>

      <Section number="01.1" title={copy.work.heading} id="work-heading">
        <p className="about-p">{copy.work.lead}</p>
        <div className="about-rows">
          {copy.work.rows.map((row) => (
            <Row
              key={row.name}
              label={row.name}
              value={row.note}
              place={rowDestination(row, locale)}
              locale={locale}
              copy={copy}
            />
          ))}
        </div>
      </Section>

      <Section number="01.2" title={copy.writing.heading} id="writing-heading">
        <p className="about-lead">{copy.writing.lead}</p>
        <div className="about-rows">
          {posts.map((post) => (
            <Row
              key={post.path}
              label={post.title}
              value={post.note}
              place={{
                href: `${siteOrigins.dump}${post.path}`,
                hrefLang:
                  locale === DEFAULT_LOCALE
                    ? undefined
                    : localizedPosts
                      ? locale
                      : "en",
              }}
              locale={locale}
              copy={copy}
            />
          ))}
        </div>
      </Section>

      <Section number="01.3" title={copy.places.heading} id="places-heading">
        <p className="about-lead">{copy.places.lead}</p>
        <ul className="about-places">
          {places.map(({ name, note, place }) => (
            <li key={name}>
              <a
                className="about-place"
                href={place.href}
                hrefLang={place.hrefLang}
                data-sound="nav"
              >
                <span className="about-place__name">{name}</span>
                <span className="about-place__note">
                  {note}
                  {locale !== DEFAULT_LOCALE && place.hrefLang === "en"
                    ? copy.englishNote
                    : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section number="01.4" title={copy.now.heading} id="now-heading">
        <div className="about-rows">
          {copy.now.projects.map((id) => {
            const project = projects.find((item) => item.id === id)!;
            const page = project.featured ? "projects" : "projects-all";
            return (
              <Row
                key={id}
                label={project.name}
                value={projectText[id].status}
                place={{ href: `${routes[page][locale]!}#${id}` }}
                locale={locale}
                copy={copy}
              />
            );
          })}
        </div>
      </Section>

      <Section number="01.5" title={copy.tools.heading} id="tools-heading">
        <p className="about-p">{copy.tools.lead}</p>
        <dl className="about-tools">
          {copy.tools.groups.map(({ name, items }) => (
            <div key={name} className="about-tools__group">
              <dt>{name}</dt>
              <dd>
                <ul className="about-chips">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
        <Link
          className="about-setup"
          href={routes.setup[locale]!}
          prefetch={false}
          data-sound="nav"
        >
          <span>{copy.tools.setupQuestion}</span>
          <span className="about-setup__dots" aria-hidden="true" />
          <span className="about-setup__link">{copy.tools.setupLink}</span>
          <span className="about-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </Section>

      <Section number="01.6" title={copy.away.heading} id="away-heading">
        {copy.away.paragraphs.map((text) => (
          <p key={text} className="about-p">
            {text}
          </p>
        ))}
        <div className="about-rows">
          {copy.away.rows.map((row) => (
            <Row
              key={row.name}
              label={row.name}
              value={row.note}
              place={rowDestination(row, locale)}
              locale={locale}
              copy={copy}
            />
          ))}
        </div>
      </Section>

      <section className="about-invite" aria-labelledby="invite-heading">
        <div>
          <h2 id="invite-heading">{copy.invite.heading}</h2>
          <p>{copy.invite.line}</p>
        </div>
        <Link
          className="about-button"
          href={routes.contact[locale]!}
          prefetch={false}
          data-sound="nav"
        >
          <span>{copy.invite.action}</span>
          <span className="about-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </>
  );
}
