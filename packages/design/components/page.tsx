import { Fragment, type ReactNode } from "react";
import { Art } from "./art";
import { siteById, type SiteId } from "./sites";

/** Index header: avatar, site name, one line. */
export function IndexHeader({
  name,
  line,
  meta,
}: {
  name: string;
  line: string;
  meta?: ReactNode;
}) {
  return (
    <header className="rv-header rv-header--index">
      <Art
        name="avatar"
        alt="RaioViajante"
        width={112}
        height={112}
        className="rv-avatar"
        priority
      />
      <h1>{name}</h1>
      <p>{line}</p>
      {meta}
    </header>
  );
}

/** Page header: caps label, title, one line, optional meta row. */
export function PageHeader({
  label,
  title,
  line,
  meta,
  children,
}: {
  label?: ReactNode;
  title: string;
  line?: ReactNode;
  /** Meta items; the first is the status word. */
  meta?: ReactNode[];
  children?: ReactNode;
}) {
  return (
    <header className="rv-header">
      {children}
      {label ? <div className="rv-label">{label}</div> : null}
      <h1>{title}</h1>
      {line ? <p>{line}</p> : null}
      {meta?.length ? (
        <div className="rv-meta">
          {meta.map((item, index) => (
            <Fragment key={index}>
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span className={index === 0 ? "rv-status" : undefined}>
                {item}
              </span>
            </Fragment>
          ))}
        </div>
      ) : null}
    </header>
  );
}

/** Numbered section heading: `01.1  Title`. */
export function SectionHeading({
  number,
  title,
  id,
}: {
  number: string;
  title: ReactNode;
  id?: string;
}) {
  return (
    <h2 id={id}>
      <span className="rv-num" aria-hidden="true">
        {number}
      </span>
      {title}
    </h2>
  );
}

export function Section({
  number,
  title,
  id,
  index = false,
  children,
}: {
  number: string;
  title: ReactNode;
  id?: string;
  /** Index pages use the larger 80px section gap. */
  index?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={index ? "rv-section rv-section--index" : "rv-section"}>
      <SectionHeading number={number} title={title} id={id} />
      {children}
    </section>
  );
}

/** Dotted leader: `name ····· value`. A link when `href` is given. */
export function LeaderRow({
  label,
  value,
  href,
  sound = "nav",
}: {
  label: ReactNode;
  value?: ReactNode;
  href?: string;
  sound?: string;
}) {
  const content = (
    <>
      <span>{label}</span>
      <span className="rv-leader__dots" aria-hidden="true" />
      {value !== undefined ? (
        <span className="rv-leader__value">{value}</span>
      ) : null}
    </>
  );
  return href ? (
    <a className="rv-leader" href={href} data-sound={sound}>
      {content}
    </a>
  ) : (
    <div className="rv-leader">{content}</div>
  );
}

export interface PagerLink {
  label: string;
  title: string;
  href: string;
}

/** Previous / next: caps label above the title, no box. */
export function Pager({ prev, next }: { prev?: PagerLink; next?: PagerLink }) {
  if (!prev && !next) return null;
  return (
    <nav className="rv-pager" aria-label="Previous and next">
      {prev ? (
        <a href={prev.href} rel="prev" data-sound="nav">
          <span className="rv-label">{prev.label}</span>
          <span>{prev.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a href={next.href} rel="next" data-sound="nav">
          <span className="rv-label">{next.label}</span>
          <span>{next.title}</span>
        </a>
      ) : null}
    </nav>
  );
}

export interface RelatedItem {
  title: string;
  site: SiteId;
  href: string;
}

/** Related rows: `title ····· site ↗`, linking to siblings on other sites. */
export function RelatedRows({ items }: { items: RelatedItem[] }) {
  return (
    <>
      {items.map((item) => (
        <LeaderRow
          key={item.href}
          href={item.href}
          label={item.title}
          value={`${siteById(item.site).label} ↗`}
        />
      ))}
    </>
  );
}

/** Wrapper that scopes the soft-block rhythm and inline-code styles. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose">{children}</div>;
}
