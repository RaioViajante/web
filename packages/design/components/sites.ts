/** The four sites. Footer, related rows and search all read this one list. */
export type SiteId = "root" | "dump" | "docs" | "lab";

export interface Site {
  id: SiteId;
  label: string;
  href: string;
}

export const SITES: readonly Site[] = [
  { id: "root", label: "raioviajante.com", href: "https://raioviajante.com" },
  { id: "dump", label: "dump", href: "https://dump.raioviajante.com" },
  { id: "docs", label: "docs", href: "https://docs.raioviajante.com" },
  { id: "lab", label: "lab", href: "https://lab.raioviajante.com" },
];

export const CONTACT = {
  email: "mail@raioviajante.com",
  cnpj: "53.021.377/0001-93",
} as const;

export function siteById(id: SiteId) {
  return SITES.find((site) => site.id === id)!;
}
