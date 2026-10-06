import type { ReactNode } from "react";
import { SiteLink, type LinkComponent } from "./link";
import { CONTACT, SITES, type SiteId } from "./sites";

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
  /** Rendered inside the group after the items (the search menu item). */
  extra?: ReactNode;
  linkComponent?: LinkComponent;
}

const pad = (index: number) => `${String(index).padStart(2, "0")}.`;

export function NavGroup({
  label,
  items,
  current,
  ariaLabel,
  extra,
  linkComponent,
}: NavGroupProps) {
  return (
    <nav className="rv-nav" aria-label={ariaLabel ?? label.toLowerCase()}>
      <div className="rv-label">{label}</div>
      {items.map((item, index) => (
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
      ))}
      {extra}
    </nav>
  );
}

export function SoundToggle() {
  return (
    <header className="rv-sound">
      <button
        type="button"
        data-sound-toggle=""
        data-sound="toggle"
        aria-pressed="false"
        aria-label="Sound off. Click to enable."
      >
        SOUND <span aria-hidden="true">OFF</span>
      </button>
    </header>
  );
}

export interface FooterProps {
  site: SiteId;
  /** This site's own legal pages. */
  termsHref?: string;
  privacyHref?: string;
  linkComponent?: LinkComponent;
}

export function Footer({
  site,
  termsHref = "/terms",
  privacyHref = "/privacy",
  linkComponent,
}: FooterProps) {
  return (
    <footer className="rv-footer">
      <nav aria-label="RaioViajante sites">
        {SITES.map((item, index) => (
          <span key={item.id}>
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            <a href={item.href} data-sound="nav">
              {item.label}
            </a>
          </span>
        ))}
      </nav>
      <div>
        <a href={`mailto:${CONTACT.email}`} data-sound="nav">
          {CONTACT.email}
        </a>
      </div>
      <div>CNPJ: {CONTACT.cnpj}</div>
      <nav aria-label="Legal">
        <SiteLink
          linkComponent={linkComponent}
          href={termsHref}
          data-sound="nav"
        >
          Terms of Use
        </SiteLink>
        <span aria-hidden="true"> · </span>
        <SiteLink
          linkComponent={linkComponent}
          href={privacyHref}
          data-sound="nav"
        >
          Privacy Policy
        </SiteLink>
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
  children,
  ...footer
}: ShellProps) {
  const { linkComponent } = footer;
  return (
    <>
      <a className="rv-skip" href="#main">
        Skip to content
      </a>
      <div className="rv-shell">
        <SoundToggle />
        <aside className="rv-sidebar">
          <NavGroup
            label="PAGES"
            items={pages}
            current={currentPage}
            extra={pagesExtra}
            linkComponent={linkComponent}
          />
          {toc?.length ? (
            <NavGroup
              label="ON THIS PAGE"
              items={toc}
              current={currentToc}
              ariaLabel="on this page"
              linkComponent={linkComponent}
            />
          ) : null}
          {experiments?.length ? (
            <NavGroup
              label="EXPERIMENTS"
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
