import Link from "next/link";

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
              <a href={site.href} data-sound="nav">
                {site.label}
              </a>
            </span>
          ))}
        </nav>
        <a
          className="rv-footer-email"
          href="mailto:mail@raioviajante.com"
          data-sound="nav"
        >
          mail@raioviajante.com
        </a>
        <p className="rv-footer-cnpj">CNPJ: 53.021.377/0001-93</p>
        <nav className="rv-footer-legal" aria-label="Legal">
          <Link href="/terms" data-sound="nav">
            Terms of Use
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href="/privacy" data-sound="nav">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
