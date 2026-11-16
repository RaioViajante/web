// The Contact page in either language. The routes in app/ only choose the
// locale.

import { LeaderRow, Section } from "@raioviajante/design/components";
import { galleryBranding } from "@raioviajante/design/gallery";
import {
  DEFAULT_LOCALE,
  participates,
  type LocaleId,
} from "../../../site/locales";
import { CONTACT, siteOrigins } from "../../../site/sites";
import { aboutCopy } from "../lib/about";
import { contactCopy } from "../lib/contact";
import { profileLinks } from "../lib/links";
import {
  ptAbout,
  ptContact,
  ptDocsHome,
  ptDumpHome,
  ptHome,
  ptLabHome,
} from "../lib/pt";
import { routes } from "../lib/routes";
import { ContactMail } from "./ContactMail";
import "../app/about/about.css";
import "../app/contact/contact.css";

const mailto = (subject: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;

/** The networks the page lists, in this order. */
const networks = ["Instagram", "X", "YouTube", "TikTok", "GitHub"];

/** One sticker from the gallery's sheet, cut out by CSS. Decorative. */
function Sticker({ className }: { className: string }) {
  const sheet = galleryBranding.stickerPreview;
  return (
    <span className={`ct-sticker ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- one cell of the shared sheet */}
      <img
        src={sheet.src}
        alt=""
        width={sheet.width}
        height={sheet.height}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

export function ContactPage({ locale }: { locale: LocaleId }) {
  const english = locale === DEFAULT_LOCALE;
  const copy = english ? contactCopy : ptContact;
  const about = english ? aboutCopy : ptAbout;
  const notes = (category: string) =>
    english ? category : (ptHome.linkCopy[category]?.note ?? category);
  // Dump's Portuguese feed only while Dump publishes in Portuguese.
  const feedInPortuguese = !english && participates("dump", locale);
  const homes = english
    ? {
        dump: { href: siteOrigins.dump, hrefLang: undefined },
        docs: { href: siteOrigins.docs, hrefLang: undefined },
        lab: { href: siteOrigins.lab, hrefLang: undefined },
      }
    : { dump: ptDumpHome, docs: ptDocsHome, lab: ptLabHome };
  const places = [
    {
      name: "raioviajante.com",
      note: about.places.notes.root,
      href: routes.home[locale]!,
      hrefLang: undefined,
    },
    { name: "dump", note: about.places.notes.dump, ...homes.dump },
    { name: "docs", note: about.places.notes.docs, ...homes.docs },
    { name: "lab", note: about.places.notes.lab, ...homes.lab },
  ];
  return (
    <>
      <header className="rv-header ct-head">
        <Sticker className="ct-sticker--hi" />
        <div className="rv-label">{copy.label}</div>
        <h1 className="ct-title">{copy.title}</h1>
        <p className="ct-intro">{copy.intro}</p>
        <span className="ct-status">
          <span className="ct-status__mark" aria-hidden="true" />
          {copy.status}
        </span>
      </header>

      <div className="ct-mail-wrap">
        <ContactMail copy={{ ...copy.mail, sticky: copy.sticky }} />
        <Sticker className="ct-sticker--thumb" />
      </div>

      <Section number="03." title={copy.offers.heading} id="offers-heading">
        <p className="about-p">{copy.offers.lead}</p>
        <ul className="ct-offers">
          {copy.offers.items.map(({ title, description }) => (
            <li key={title}>
              <a
                className="ct-offer"
                href={mailto(`${copy.offers.subject}${title}`)}
                data-sound="nav"
              >
                <span className="ct-offer__title">{title}</span>
                <span className="ct-offer__text">{description}</span>
                <span className="ct-offer__go">
                  {copy.offers.action} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section number="03.1" title={copy.pitch.heading} id="pitch-heading">
        <p className="about-p">{copy.pitch.lead}</p>
        <ul className="ct-list">
          {copy.pitch.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <figure className="ct-example">
          <figcaption>{copy.pitch.exampleLabel}</figcaption>
          <p>{copy.pitch.example}</p>
        </figure>
        <div className="ct-next">
          <h3 className="ct-caps">{copy.pitch.nextLabel}</h3>
          <ol>
            {copy.pitch.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </Section>

      <Section number="03.2" title={copy.free.heading} id="free-heading">
        <p className="about-p">{copy.free.lead}</p>
        <ul className="ct-free">
          {copy.free.items.map(({ title, description, subject }) => (
            <li key={title}>
              <a
                className="ct-free__item"
                href={mailto(subject)}
                data-sound="nav"
              >
                <span className="ct-free__title">{title}</span>
                <span className="ct-free__text">{description}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        number="03.3"
        title={copy.elsewhere.heading}
        id="elsewhere-heading"
      >
        <h3 className="ct-caps ct-group">{copy.elsewhere.social}</h3>
        <div className="about-rows">
          {networks.map((name) => {
            const link = profileLinks.find((item) => item.label === name)!;
            return (
              <LeaderRow
                key={name}
                label={link.label}
                value={notes(link.category)}
                href={link.href}
                rel={link.rel}
                newTab={locale}
              />
            );
          })}
          <LeaderRow
            label={
              feedInPortuguese || english ? "RSS" : `RSS${about.englishNote}`
            }
            value={copy.elsewhere.feed}
            href={`${siteOrigins.dump}${feedInPortuguese ? "/pt/rss.xml" : "/rss.xml"}`}
            hrefLang={english ? undefined : feedInPortuguese ? locale : "en"}
            newTab={locale}
          />
        </div>
        <h3 className="ct-caps ct-group">{copy.elsewhere.ecosystem}</h3>
        <ul className="about-places">
          {places.map(({ name, note, href, hrefLang }) => (
            <li key={name}>
              <a
                className="about-place"
                href={href}
                hrefLang={hrefLang}
                data-sound="nav"
              >
                <span className="about-place__name">{name}</span>
                <span className="about-place__note">
                  {note}
                  {!english && hrefLang === "en" ? about.englishNote : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <div className="ct-bye">
        <Sticker className="ct-sticker--peek" />
        <p>{copy.bye}</p>
        <p className="ct-sign">— Bryan</p>
      </div>
    </>
  );
}
