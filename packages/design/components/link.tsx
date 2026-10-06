import type { AnchorHTMLAttributes, ComponentType } from "react";

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
