import { createHash } from "node:crypto";
import { siteOrigins, type SiteId as Site } from "../site/sites.ts";

function styleHash(value: string) {
  return `'sha256-${createHash("sha256").update(value).digest("base64")}'`;
}

// Exact existing SSR style attributes; CSSOM updates by trusted scripts do not
// need unsafe-inline. Shiki already emits classes in this repository.
const styleAttributes: Partial<Record<Site, string[]>> = {
  root: [
    "color:transparent",
    ...Array.from({ length: 10 }, (_, i) => `animation-delay:${i * 105}ms`),
  ],
  lab: ["display:contents"],
};

/**
 * Exceptions to the no-framing default. Each one is granted to named paths
 * only (`rootFraming`, `workHeaders`); everything else keeps `'none'`.
 */
export interface Framing {
  /** The page may embed same-origin frames. */
  frameSelf?: boolean;
  /** The page may be embedded by a same-origin page. */
  embeddableBySelf?: boolean;
}

/** Root's case pages, which show the demo under /work/ in an iframe. */
export const demoHostPaths = ["/projects/stucco", "/pt/projects/stucco"];

/** The framing a nonce-carrying Root page gets, by exact path. */
export function rootFraming(pathname: string): Framing {
  return demoHostPaths.includes(pathname) ? { frameSelf: true } : {};
}

export function contentSecurityPolicy(
  site: Site,
  nonce?: string,
  development = false,
  framing: Framing = {},
) {
  if (nonce && !/^[A-Za-z0-9+/]+={0,2}$/.test(nonce))
    throw new Error("Invalid CSP nonce");
  const scripts = nonce ? `'nonce-${nonce}' 'strict-dynamic' 'self'` : "'self'";
  const styles = styleAttributes[site];
  return [
    "default-src 'none'",
    `script-src ${scripts}${site === "dump" ? " https://giscus.app" : ""}${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self'${nonce && !development ? ` 'nonce-${nonce}'` : ""}${site === "dump" ? " https://giscus.app" : ""}${development ? " 'unsafe-inline'" : ""}`,
    `style-src-attr ${styles ? `'unsafe-hashes' ${styles.map(styleHash).join(" ")}` : "'none'"}`,
    "img-src 'self'",
    "font-src 'self'",
    `connect-src 'self' ${Object.entries(siteOrigins)
      .filter(([id]) => id !== site)
      .map(([, origin]) => origin)
      .join(" ")}`,
    `frame-src ${site === "dump" ? "https://giscus.app" : framing.frameSelf ? "'self'" : "'none'"}`,
    "worker-src 'none'",
    "media-src 'none'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${framing.embeddableBySelf ? "'self'" : "'none'"}`,
    // Upgrading would send a frame navigation on local http to https, which
    // 'self' then refuses. These documents load only 'self' resources, so on
    // the https production origin the directive has nothing to upgrade.
    ...(!development && !framing.frameSelf && !framing.embeddableBySelf
      ? ["upgrade-insecure-requests"]
      : []),
  ].join("; ");
}

export function securityHeaders(site: Site) {
  return [
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      // Keep user-initiated Web Audio and code-copy controls. Giscus's iframe
      // explicitly requests clipboard-write for its own copy controls.
      value: `camera=(), microphone=(), geolocation=(), display-capture=(), payment=(), usb=(), fullscreen=(), autoplay=(self), clipboard-read=(), clipboard-write=(${site === "root" ? "" : "self"}${site === "dump" ? ' "https://giscus.app"' : ""})`,
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}

export function staticHeaders(site: Site) {
  return [
    ...securityHeaders(site),
    { key: "Content-Security-Policy", value: contentSecurityPolicy(site) },
  ];
}

/**
 * Root's static demos under /work/: embeddable by Root's own pages, and kept
 * out of search through this header. robots.txt must not disallow them, or
 * crawlers would never read it.
 */
export function workHeaders() {
  return [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy("root", undefined, false, {
        embeddableBySelf: true,
      }),
    },
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
  ];
}
