import { createHash } from "node:crypto";

export type Site = "root" | "dump" | "docs" | "lab";

export const siteOrigins: Record<Site, string> = {
  root: "https://raioviajante.com",
  dump: "https://dump.raioviajante.com",
  docs: "https://docs.raioviajante.com",
  lab: "https://lab.raioviajante.com",
};

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

export function contentSecurityPolicy(
  site: Site,
  nonce?: string,
  development = false,
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
    `frame-src ${site === "dump" ? "https://giscus.app" : "'none'"}`,
    "worker-src 'none'",
    "media-src 'none'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(!development ? ["upgrade-insecure-requests"] : []),
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
