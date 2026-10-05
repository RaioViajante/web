import Link from "next/link";

const destinations = [
  {
    label: "raioviajante.com",
    note: "start here",
    href: "https://raioviajante.com",
  },
  { label: "dump", note: "writing", href: "/" },
  {
    label: "docs",
    note: "documentation",
    href: "https://docs.raioviajante.com",
  },
  { label: "lab", note: "experiments", href: "https://lab.raioviajante.com" },
];

export default function NotFound() {
  return (
    <div className="not-found-page">
      <header className="rv-hero">
        <p className="rv-eyebrow">404</p>
        <h1>not here</h1>
        <p className="rv-dek">
          this page moved, never existed, or broke in the lab.
        </p>
      </header>
      <section className="rv-section">
        <h2 className="rv-section-heading">
          <span className="rv-section-number">01.</span>Go somewhere else
        </h2>
        {destinations.map(({ label, note, href }) =>
          href.startsWith("/") ? (
            <Link
              className="dump-leader"
              data-sound="nav"
              href={href}
              key={href}
            >
              <span>{label}</span>
              <span className="dump-dots" aria-hidden="true" />
              <span>{note}</span>
            </Link>
          ) : (
            <a className="dump-leader" data-sound="nav" href={href} key={href}>
              <span>{label}</span>
              <span className="dump-dots" aria-hidden="true" />
              <span>{note}</span>
            </a>
          ),
        )}
      </section>
    </div>
  );
}
