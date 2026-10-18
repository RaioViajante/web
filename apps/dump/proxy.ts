import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "../../security/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localeOfPath,
  stripLocalePrefix,
  type LocaleId,
} from "../../site/locales";
import {
  publishedPostPaths,
  publishedTagPaths,
} from "./lib/published-routes.generated";

const published = {
  en: new Set<string>([...publishedPostPaths.en, ...publishedTagPaths.en]),
  "pt-BR": new Set<string>([
    ...publishedPostPaths["pt-BR"],
    ...publishedTagPaths["pt-BR"],
  ]),
} satisfies Record<LocaleId, Set<string>>;

function isDynamicContentPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path.startsWith("/posts/") || path.startsWith("/tags/");
}

export function isPublishedDynamicPath(pathname: string): boolean {
  return published[localeOfPath(pathname)].has(pathname);
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
  const locale = localeOfPath(request.nextUrl.pathname);
  // URL-only locale authority: overwrite any value supplied by the client.
  headers.set("x-locale", locale);
  headers.set("Content-Security-Policy", csp);
  const invalidDynamicRoute =
    isDynamicContentPath(request.nextUrl.pathname) &&
    !isPublishedDynamicPath(request.nextUrl.pathname);
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
    "/((?!_next/static|_next/image|favicon\\.ico$|icon\\.png$|apple-touch-icon\\.png$|apple-icon\\.png$|icon-192\\.png$|icon-maskable\\.png$|manifest\\.webmanifest$|robots\\.txt$|sitemap\\.xml$|search-index\\.json$|pt/search-index\\.json$|rss\\.xml$|giscus\\.css$).*)",
  ],
};
