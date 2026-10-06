import type { ReactNode } from "react";
import { CONTACT, SITES, type SiteId } from "./sites";

export interface NavItem {
  label: string;
  href: string;
  /** Overrides the automatic `00.` numbering, for example `001` on lab. */
  number?: string;
}

export interface NavGroupProps {
  label: string;
  items: NavItem[];
  /** The item whose `href` equals this value is current. */
  current?: string;
  ariaLabel?: string;
  /** Rendered inside the group after the items (the search menu item). */
  extra?: ReactNode;
}

const pad = (index: number) => `${String(index).padStart(2, "0")}.`;

export function NavGroup({
  label,
  items,
  current,
  ariaLabel,
  extra,
}: NavGroupProps) {
  return (
    <nav className="rv-nav" aria-label={ariaLabel ?? label.toLowerCase()}>
      <div className="rv-label">{label}</div>
      {items.map((item, index) => (
        <a
          key={item.href}
          href={item.href}
          data-sound="nav"
          aria-current={item.href === current ? "page" : undefined}
        >
          <span className="rv-nav__num">{item.number ?? pad(index)}</span>
          <span>{item.label}</span>
        </a>
      ))}
      {extra}
    </nav>
  );
}

export function SoundToggle() {
  return (
    <div className="rv-sound">
      <button
        type="button"
        data-sound-toggle=""
        data-sound="toggle"
        aria-pressed="false"
        aria-label="Sound off. Click to enable."
      >
        SOUND <span aria-hidden="true">OFF</span>
      </button>
    </div>
  );
}

export interface FooterProps {
  site: SiteId;
  /** This site's own legal pages. */
  termsHref?: string;
  privacyHref?: string;
}

export function Footer({
  site,
  termsHref = "/terms",
  privacyHref = "/privacy",
}: FooterProps) {
  return (
    <footer className="rv-footer">
      <nav aria-label="RaioViajante sites">
        {SITES.map((item, index) => (
          <span key={item.id}>
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            <a
              href={item.href}
              data-sound="nav"
              aria-current={item.id === site ? "page" : undefined}
            >
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
        <a href={termsHref} data-sound="nav">
          Terms of Use
        </a>
        <span aria-hidden="true"> · </span>
        <a href={privacyHref} data-sound="nav">
          Privacy Policy
        </a>
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
  return (
    <>
      <a className="rv-skip" href="#main">
        Skip to content
      </a>
      <div className="rv-shell">
        <aside className="rv-sidebar">
          <NavGroup
            label="PAGES"
            items={pages}
            current={currentPage}
            extra={pagesExtra}
          />
          {toc?.length ? (
            <NavGroup
              label="ON THIS PAGE"
              items={toc}
              current={currentToc}
              ariaLabel="on this page"
            />
          ) : null}
          {experiments?.length ? (
            <NavGroup
              label="EXPERIMENTS"
              items={experiments}
              current={currentExperiment}
            />
          ) : null}
        </aside>
        <main className="rv-main" id="main">
          <div className="rv-column">
            <SoundToggle />
            {children}
            <Footer {...footer} />
          </div>
        </main>
      </div>
    </>
  );
}
