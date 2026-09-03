/**
 * Canonical origin (no trailing slash), resolved in priority order:
 *   1. `NEXT_PUBLIC_SITE_URL` — set this in Vercel for the production domain.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's automatic production host.
 *   3. `localhost:3000` — local fallback.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Site-wide constants. These feed metadata, RSS, and the sitemap, so keep them
 * in one place.
 */
export const site = {
  name: "dump",
  tagline: "a memory dump, hopefully readable.",
  description:
    "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
  author: "RaioViajante",
  locale: "en",
  /** Canonical origin, no trailing slash. */
  url: resolveSiteUrl(),
} as const;

/** Build an absolute URL from a root-relative path. */
export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
