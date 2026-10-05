const sites = [
  ["raioviajante.com", "https://raioviajante.com"],
  ["dump", "https://dump.raioviajante.com"],
  ["docs", "https://docs.raioviajante.com"],
  ["lab", "https://lab.raioviajante.com"],
] as const;

export function SiteFooter() {
  return (
    <footer className="rv-frame">
      <div className="rv-footer">
        <nav className="rv-footer-links" aria-label="RaioViajante sites">
          {sites.map(([label, href], index) => (
            <span key={href}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <a
                href={href}
                aria-current={label === "dump" ? "page" : undefined}
              >
                {label}
              </a>
            </span>
          ))}
        </nav>
        <a className="rv-footer-email" href="mailto:mail@raioviajante.com">
          mail@raioviajante.com
        </a>
        <p className="rv-footer-cnpj">CNPJ: 53.021.377/0001-93</p>
        <nav className="rv-footer-legal" aria-label="Legal">
          <a href="https://raioviajante.com/terms">Terms of Use</a>
          <span aria-hidden="true"> · </span>
          <a href="https://raioviajante.com/privacy">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  );
}
