import type { AnchorHTMLAttributes, ComponentType } from "react";
import type { LocaleId } from "../../../site/locales";
import { SITES, siteOrigins } from "../../../site/sites";
import { catalogFor } from "../catalog";

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
 * anchor for everything else. With `newTab` (the page's locale), a link that
 * leaves the four sites opens in a new tab, adds `noopener` to `rel` and says
 * so to assistive technology in that language; any other link ignores it.
 */
export function SiteLink({
  linkComponent: Link,
  href,
  newTab,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  linkComponent?: LinkComponent;
  newTab?: LocaleId;
}) {
  if (newTab && leavesEcosystem(href)) {
    const { rel, children, ...rest } = props;
    return (
      <a
        href={href}
        {...rest}
        target="_blank"
        rel={[rel, "noopener"].filter(Boolean).join(" ")}
      >
        {children}
        <span className="rv-sr-only">
          {` (${catalogFor(newTab).links.newTab})`}
        </span>
      </a>
    );
  }
  return Link && isInternal(href) ? (
    <Link href={href} prefetch={false} {...props} />
  ) : (
    <a href={href} {...props} />
  );
}
