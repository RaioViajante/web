import { Fragment, type ReactNode } from "react";
import { Art } from "./art";
import { SiteLink, type LinkComponent } from "./link";
import { siteById, type SiteId } from "../../../site/sites";

/** Index header: avatar, site name, one line. */
export function IndexHeader({
  name,
  line,
  meta,
  avatar,
}: {
  name: string;
  line: string;
  meta?: ReactNode;
  /** Replaces the static avatar, for a site that animates it. Use `.rv-avatar`. */
  avatar?: ReactNode;
}) {
  return (
    <header className="rv-header rv-header--index">
      {avatar ?? (
        <Art
          name="avatar"
          alt="RaioViajante"
          width={112}
          height={112}
          className="rv-avatar"
          priority
        />
      )}
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
  headingExtra,
  children,
}: {
  number: string;
  title: ReactNode;
  id?: string;
  /** Index pages use the larger 80px section gap. */
  index?: boolean;
  /** Optional controls aligned with the heading (for example lab filters). */
  headingExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={index ? "rv-section rv-section--index" : "rv-section"}>
      {headingExtra ? (
        <div className="rv-section__heading">
          <SectionHeading number={number} title={title} id={id} />
          {headingExtra}
        </div>
      ) : (
        <SectionHeading number={number} title={title} id={id} />
      )}
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
  describedBy,
  wrapValue = false,
  linkComponent,
  rel,
}: {
  label: ReactNode;
  value?: ReactNode;
  /** Allow structured metadata, such as a list of tags, to wrap. */
  wrapValue?: boolean;
  href?: string;
  sound?: string;
  /** Id of a tooltip that describes the link. */
  describedBy?: string;
  linkComponent?: LinkComponent;
  /** Link relation, for example `me` on a profile of the site's owner. */
  rel?: string;
}) {
  const content = (
    <>
      <span>{label}</span>
      <span className="rv-leader__dots" aria-hidden="true" />
      {value !== undefined ? (
        <span
          className={
            wrapValue || (typeof value === "string" && value.length > 24)
              ? "rv-leader__value rv-leader__value--long"
              : "rv-leader__value"
          }
        >
          {value}
        </span>
      ) : null}
    </>
  );
  return href ? (
    <SiteLink
      linkComponent={linkComponent}
      className="rv-leader"
      href={href}
      data-sound={sound}
      aria-describedby={describedBy}
      rel={rel}
    >
      {content}
    </SiteLink>
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
export function Pager({
  prev,
  next,
  linkComponent,
}: {
  prev?: PagerLink;
  next?: PagerLink;
  linkComponent?: LinkComponent;
}) {
  if (!prev && !next) return null;
  return (
    <nav className="rv-pager" aria-label="Previous and next">
      {prev ? (
        <SiteLink
          linkComponent={linkComponent}
          href={prev.href}
          rel="prev"
          data-sound="nav"
        >
          <span className="rv-label">{prev.label}</span>
          <span>{prev.title}</span>
        </SiteLink>
      ) : (
        <span />
      )}
      {next ? (
        <SiteLink
          linkComponent={linkComponent}
          href={next.href}
          rel="next"
          data-sound="nav"
        >
          <span className="rv-label">{next.label}</span>
          <span>{next.title}</span>
        </SiteLink>
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
