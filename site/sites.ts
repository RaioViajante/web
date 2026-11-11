// The four sites and the public contact facts, defined once. This layer is
// neutral: it imports nothing from packages/design, security/, seo/ or the apps,
// and they all import it (docs/architecture.md). Page copy that mentions these
// facts stays in the pages; a test checks that it agrees with this file.

export type SiteId = "root" | "dump" | "docs" | "lab";

export interface Site {
  id: SiteId;
  /** The short name shown in the footer, search and related rows. */
  label: string;
  /** The production origin, without a trailing slash. */
  href: string;
}

export const SITES: readonly Site[] = [
  { id: "root", label: "raioviajante.com", href: "https://raioviajante.com" },
  { id: "dump", label: "dump", href: "https://dump.raioviajante.com" },
  { id: "docs", label: "docs", href: "https://docs.raioviajante.com" },
  { id: "lab", label: "lab", href: "https://lab.raioviajante.com" },
];

/** Production origin by site id. */
export const siteOrigins = Object.fromEntries(
  SITES.map((site) => [site.id, site.href]),
) as Record<SiteId, string>;

export const CONTACT = {
  email: "mail@raioviajante.com",
  cnpj: "53.021.377/0001-93",
} as const;

/**
 * Root's locale-neutral page about all four sites. The other sites' footers
 * link it; Root's own route table must keep this path (a Root test checks).
 */
export const ABOUT_SITES_PATH = "/this-site";

/** The hostnames of the four sites, with the `www` alias Root redirects. */
const ecosystemHosts = new Set(
  SITES.flatMap((site) => {
    const host = new URL(site.href).hostname;
    return [host, `www.${host}`];
  }),
);

/**
 * Whether a link takes the visitor out of the RaioViajante sites: an http(s)
 * URL on any other host. Paths, fragments, `mailto:` and the four sites stay.
 */
export function leavesEcosystem(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  return (
    (url.protocol === "https:" || url.protocol === "http:") &&
    !ecosystemHosts.has(url.hostname)
  );
}

export function siteById(id: SiteId) {
  return SITES.find((site) => site.id === id)!;
}
