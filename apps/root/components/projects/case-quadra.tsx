// The Quadra case page. The route in app/ only chooses the locale.

import Link from "next/link";
import { SiteLink, TypedTitle } from "@raioviajante/design/components";
import {
  quadraBrand,
  quadraTour,
  type QuadraImage,
} from "@raioviajante/design/quadra";
import type { LocaleId } from "../../../../site/locales";
import { quadraCopyFor } from "./copy";
import { routes } from "../../lib/routes";
import { quadraPartner } from "../../lib/quadra";
import { AllProjectsBack } from "./catalog";
import { Email } from "./cards";
import { CaseDemo } from "./CaseDemo";
import { CaseTour } from "./CaseTour";
import "@raioviajante/design/project-art.css";
import "./pages.css";
import "./stucco-case.css";
import "./quadra-case.css";

const DEMO = "/work/quadra/";

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

function Board({
  image,
  alt,
  sizes,
}: {
  image: QuadraImage;
  alt: string;
  sizes: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static derivative with its own srcset
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      alt={alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
    />
  );
}

export function QuadraCase({ locale }: { locale: LocaleId }) {
  const copy = quadraCopyFor(locale);
  const { tour, brand } = copy;
  return (
    <>
      <AllProjectsBack locale={locale} />
      <header className="sc-head">
        <div className="sc-kick">{copy.kicker}</div>
        <TypedTitle text={copy.title} className="sc-h1" />
        <p className="sc-sub">{copy.intro}</p>
        <p className="sc-credit">
          {copy.credit.with}{" "}
          <SiteLink href={quadraPartner.profile} newTab={locale}>
            {quadraPartner.name}
          </SiteLink>
          <span aria-hidden="true">·</span>
          <SiteLink href={quadraPartner.profile} newTab={locale}>
            {copy.credit.profile}
            <span className="rv-sr-only">: {quadraPartner.name}</span>
          </SiteLink>
        </p>
        <p className="sc-note-top">{copy.note}</p>
        <div className="sc-act">
          <CaseDemo
            text={copy.demo}
            demo={DEMO}
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
      <CaseTour text={tour} tour={quadraTour} demo={DEMO} />
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
        <p className="sc-p">{copy.done.lead}</p>
        <ul className="sc-done">
          {copy.done.groups.flatMap(({ title, items }) => [
            <li key={title} className="h">
              {title}
            </li>,
            ...items.map((item) => (
              <li key={`${title}-${item}`} className="i">
                {item}
              </li>
            )),
          ])}
        </ul>
      </Section>
      <Section id="sc-brand" number="05" heading={brand.heading}>
        <p className="sc-p">{brand.lead}</p>
        <figure className="bd-cover qd-cover">
          <Board
            image={quadraBrand.cover}
            alt={brand.coverAlt}
            sizes="(max-width: 760px) 92vw, 740px"
          />
          <figcaption>{brand.cover}</figcaption>
        </figure>
        <div className="bd-grid qd-boards">
          {quadraBrand.boards.map(({ key, image }) => (
            <figure key={key} className="qd-board">
              <Board
                image={image}
                alt={brand.boards[key].title}
                sizes="(max-width: 760px) 92vw, 240px"
              />
              <figcaption className="bd-t">
                <b>{brand.boards[key].title}</b>
                <span>{brand.boards[key].spec}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section id="sc-tech" number="06" heading={copy.tech.heading}>
        <p className="sc-p">{copy.tech.lead}</p>
        <dl className="sc-tech">
          {copy.tech.rows.map(({ term, value }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section id="sc-again" number="07" heading={copy.reimagined.heading}>
        <p className="sc-p">{copy.reimagined.lead}</p>
        <div className="sc-two">
          {[copy.reimagined.original, copy.reimagined.concepts].map(
            ({ title, items }) => (
              <div key={title}>
                <h3>{title}</h3>
                <ul className="sc-ul">
                  <Items items={items} />
                </ul>
              </div>
            ),
          )}
        </div>
      </Section>
      <Section id="sc-result" number="08" heading={copy.result.heading}>
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
