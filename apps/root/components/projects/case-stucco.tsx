// The Stucco. case page. The route in app/ only chooses the locale.

import Link from "next/link";
import {
  stuccoBrand,
  stuccoTour,
  type StuccoImage,
} from "@raioviajante/design/stucco";
import type { LocaleId } from "../../../../site/locales";
import { stuccoCopyFor } from "./copy";
import { routes } from "../../lib/routes";
import type { StuccoCopy, StuccoPiece } from "../../lib/stucco";
import { AllProjectsBack } from "./catalog";
import { Email } from "./cards";
import { StuccoBrandPiece } from "./StuccoBrandPiece";
import { StuccoDemo } from "./StuccoDemo";
import { StuccoTour } from "./StuccoTour";
import "@raioviajante/design/project-art.css";
import "./pages.css";
import "./stucco-case.css";

function Section({
  id,
  number,
  heading,
  children,
}: {
  id: string;
  number: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sc-sec" aria-labelledby={id}>
      <h2 id={id}>
        <span>{number}</span>
        {heading}
      </h2>
      {children}
    </section>
  );
}

const Items = ({ items }: { items: readonly string[] }) =>
  items.map((item) => <li key={item}>{item}</li>);

function artAlt(id: StuccoPiece, text: StuccoCopy["brand"]) {
  const { title } = text.pieces[id];
  if (id === "car") return [`${title} · ${text.art}`];
  return id === "social"
    ? [`${title} · ${text.icon}`, `${title} · ${text.post}`]
    : [`${title} · ${text.front}`, `${title} · ${text.back}`];
}

function Cover({
  image,
  alt,
  caption,
}: {
  image: StuccoImage;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="bd-cover">
      {/* eslint-disable-next-line @next/next/no-img-element -- static derivative with its own srcset */}
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="(max-width: 760px) 92vw, 740px"
        alt={alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function StuccoCase({ locale }: { locale: LocaleId }) {
  const copy = stuccoCopyFor(locale);
  const { tour, brand } = copy;
  return (
    <>
      <AllProjectsBack locale={locale} />
      <header className="sc-head">
        <div className="sc-kick">{copy.kicker}</div>
        <h1 className="sc-h1">{copy.title}</h1>
        <p className="sc-sub">{copy.intro}</p>
        <p className="sc-note-top">{copy.note}</p>
        <div className="sc-act">
          <StuccoDemo
            text={copy.demo}
            devices={{ desktop: tour.desktop, mobile: tour.mobile }}
            deviceLabel={tour.device}
          />
          <span className="sc-note">{copy.demo.hint}</span>
        </div>
      </header>
      <dl className="sc-facts sc-top" data-motion-group>
        {copy.facts.map(({ term, value, wide }) => (
          <div key={term} className={wide ? "sc-wide" : undefined}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <StuccoTour text={tour} tour={stuccoTour} />
      <Section id="sc-brief" number="02" heading={copy.brief.heading}>
        <p className="sc-p">{copy.brief.lead}</p>
        <ul className="sc-ul">
          <Items items={copy.brief.items} />
        </ul>
        <p className="sc-p sc-aside">{copy.brief.note}</p>
      </Section>
      <Section id="sc-goals" number="03" heading={copy.goals.heading}>
        <ol className="sc-ol">
          <Items items={copy.goals.items} />
        </ol>
      </Section>
      <Section id="sc-done" number="04" heading={copy.done.heading}>
        <ul className="sc-done">
          {copy.done.groups.flatMap(({ title, items }) => [
            <li key={title} className="h">
              {title}
            </li>,
            ...items.map((item) => (
              <li key={item} className="i">
                {item}
              </li>
            )),
          ])}
        </ul>
      </Section>
      <Section id="sc-brand" number="05" heading={brand.heading}>
        <p className="sc-p">{brand.lead}</p>
        <Cover
          image={stuccoBrand.cover}
          alt={brand.coverAlt}
          caption={brand.cover}
        />
        <div className="bd-grid">
          {stuccoBrand.pieces.map((piece) => (
            <StuccoBrandPiece
              key={piece.key}
              id={piece.key}
              mockup={piece.mockup}
              art={piece.art}
              artAlt={artAlt(piece.key, brand)}
              text={brand}
            />
          ))}
        </div>
      </Section>
      <Section id="sc-tech" number="06" heading={copy.tech.heading}>
        <dl className="sc-tech">
          {copy.tech.rows.map(({ term, value }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section id="sc-result" number="07" heading={copy.result.heading}>
        <p className="sc-p">{copy.result.lead}</p>
        <ul className="sc-ul">
          <Items items={copy.result.items} />
        </ul>
      </Section>
      <div className="sc-foot">
        <Email lead={copy.cta} />
        <Link
          className="sc-pill"
          href={routes.projects[locale]!}
          prefetch={false}
          data-sound="nav"
        >
          <span className="a" aria-hidden="true">
            ←
          </span>
          <span>{copy.backAll}</span>
          <span className="l" aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
