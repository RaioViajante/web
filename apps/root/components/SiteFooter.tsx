const sites = [
  { label: "raioviajante.com", href: "https://raioviajante.com" },
  { label: "dump", href: "https://dump.raioviajante.com" },
  { label: "docs", href: "https://docs.raioviajante.com" },
  { label: "lab", href: "https://lab.raioviajante.com" },
];

export function SiteFooter() {
  return (
    <footer className="rv-frame">
      <div className="rv-footer">
        <nav className="rv-footer-links" aria-label="RaioViajante sites">
          {sites.map((site, index) => (
            <span key={site.href}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              <a href={site.href}>{site.label}</a>
            </span>
          ))}
        </nav>
        <a className="rv-footer-email" href="mailto:mail@raioviajante.com">
          mail@raioviajante.com
        </a>
      </div>
    </footer>
  );
}
