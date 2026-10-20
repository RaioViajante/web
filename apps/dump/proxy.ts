import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "../../security/headers";
import { DEFAULT_LOCALE, LOCALES, type LocaleId } from "../../site/locales";
import {
  publishedPostPaths,
  publishedTagPaths,
} from "./lib/published-routes.generated";
import {
  decodeTagPathSegment,
  encodeTagSlug,
  tagLookupSlug,
} from "./lib/tag-route";

export type PublishedDynamicPaths = Record<LocaleId, ReadonlySet<string>>;

function tagManifestLookupPath(locale: LocaleId, path: string): string {
  const start = `${LOCALES[locale].urlPrefix}/tags/`;
  const segment = path.startsWith(start) ? path.slice(start.length) : "";
  const slug = decodeTagPathSegment(segment);
  const lookup = slug && tagLookupSlug(locale, slug);
  if (!lookup)
    throw new Error(`Invalid generated tag route ${JSON.stringify(path)}.`);
  return `${start}${encodeTagSlug(lookup)}`;
}

const published: PublishedDynamicPaths = {
  en: new Set<string>([
    ...publishedPostPaths.en,
    ...publishedTagPaths.en.map((path) => tagManifestLookupPath("en", path)),
  ]),
  "pt-BR": new Set<string>([
    ...publishedPostPaths["pt-BR"],
    ...publishedTagPaths["pt-BR"].map((path) =>
      tagManifestLookupPath("pt-BR", path),
    ),
  ]),
};

interface GuardedPath {
  locale: LocaleId;
  dynamic: boolean;
  malformed: boolean;
  lookupPath?: string;
}

/**
 * Parse only the URL pathname the client requested. This deliberately avoids
 * the general locale helpers: those reject protocol-relative-looking paths,
 * while the proxy must turn such input into a localized 404 rather than throw.
 */
export function guardedPath(pathname: string): GuardedPath {
  const locale: LocaleId =
    pathname === LOCALES["pt-BR"].urlPrefix ||
    pathname.startsWith(`${LOCALES["pt-BR"].urlPrefix}/`)
      ? "pt-BR"
      : DEFAULT_LOCALE;
  const neutral =
    locale === DEFAULT_LOCALE
      ? pathname
      : pathname.slice(LOCALES[locale].urlPrefix.length) || "/";
  const malformed = pathname.startsWith("//") || neutral.includes("//");
  const match = /^\/(posts|tags)\/(.*)$/.exec(neutral);
  if (!match) return { locale, dynamic: false, malformed };

  // Let Next preserve its established redirect for a published URL with one
  // trailing slash. All other extra separators are malformed route input.
  const rawSlug = match[2]!.endsWith("/") ? match[2]!.slice(0, -1) : match[2]!;
  if (!rawSlug || rawSlug.includes("/"))
    return { locale, dynamic: true, malformed: true };

  // English tag routes have historically been case-insensitive. Encoded
  // unreserved characters in both post and tag slugs also reached the same
  // page. Tags use the shared single-decode identity contract; post slugs
  // remain case-sensitive.
  const kind = match[1]!;
  if (kind === "tags") {
    const slug = decodeTagPathSegment(rawSlug);
    const lookup = slug && tagLookupSlug(locale, slug);
    if (!lookup) return { locale, dynamic: true, malformed: true };
    return {
      locale,
      dynamic: true,
      malformed,
      lookupPath: `${LOCALES[locale].urlPrefix}/tags/${encodeTagSlug(lookup)}`,
    };
  }

  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return { locale, dynamic: true, malformed: true };
  }
  if (!slug || slug.includes("/") || slug.includes("\\"))
    return { locale, dynamic: true, malformed: true };
  return {
    locale,
    dynamic: true,
    malformed,
    lookupPath: `${LOCALES[locale].urlPrefix}/${kind}/${slug}`,
  };
}

export function isPublishedDynamicPath(
  pathname: string,
  inventory: PublishedDynamicPaths = published,
): boolean {
  const guarded = guardedPath(pathname);
  return Boolean(
    guarded.dynamic &&
    !guarded.malformed &&
    guarded.lookupPath &&
    inventory[guarded.locale].has(guarded.lookupPath),
  );
}

export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const csp = contentSecurityPolicy(
    "dump",
    nonce,
    process.env.NODE_ENV === "development",
  );
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  const guarded = guardedPath(request.nextUrl.pathname);
  const { locale } = guarded;
  // URL-only locale authority: overwrite any value supplied by the client.
  headers.set("x-locale", locale);
  headers.set("Content-Security-Policy", csp);
  const invalidDynamicRoute =
    guarded.malformed ||
    (guarded.dynamic &&
      (!guarded.lookupPath || !published[locale].has(guarded.lookupPath)));
  const response = invalidDynamicRoute
    ? NextResponse.rewrite(
        new URL(`${LOCALES[locale].urlPrefix}/__dump-not-found`, request.url),
        { request: { headers } },
      )
    : NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico$|icon\\.png$|apple-touch-icon\\.png$|apple-icon\\.png$|icon-192\\.png$|icon-maskable\\.png$|manifest\\.webmanifest$|robots\\.txt$|sitemap\\.xml$|search-index\\.json$|pt/search-index\\.json$|rss\\.xml$|pt/rss\\.xml$|giscus\\.css$).*)",
  ],
};
