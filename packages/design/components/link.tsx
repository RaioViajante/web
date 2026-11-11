import type { AnchorHTMLAttributes, ComponentType } from "react";
import { SITES, siteOrigins } from "../../../site/sites";

/**
 * What an app hands the shared components to render its internal links:
 * `next/link` on Next.js apps, nothing (plain anchors) on Astro apps.
 */
export type LinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: false }
>;

/** A path on this site, as opposed to another site or a `mailto:`. */
export function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/** The four sites' hostnames, with the one `www` alias that exists (Root's). */
const ecosystemHosts = new Set([
  ...SITES.map((site) => new URL(site.href).hostname),
  `www.${new URL(siteOrigins.root).hostname}`,
]);

/**
 * Whether a link takes the visitor out of the RaioViajante sites: an http(s)
 * destination, protocol-relative ones included, on any other host. Paths,
 * fragments, `mailto:` and the four sites stay.
 */
export function leavesEcosystem(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href, siteOrigins.root);
  } catch {
    return false;
  }
  return (
    (url.protocol === "https:" || url.protocol === "http:") &&
    !ecosystemHosts.has(url.hostname.replace(/\.$/, ""))
  );
}

/**
 * An anchor that uses the app's link component for internal paths and a plain
 * anchor for everything else.
 */
export function SiteLink({
  linkComponent: Link,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  linkComponent?: LinkComponent;
}) {
  return Link && isInternal(href) ? (
    <Link href={href} prefetch={false} {...props} />
  ) : (
    <a href={href} {...props} />
  );
}
