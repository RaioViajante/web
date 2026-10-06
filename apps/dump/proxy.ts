import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "../../security/headers";

export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const csp = contentSecurityPolicy(
    "dump",
    nonce,
    process.env.NODE_ENV === "development",
  );
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico$|icon\\.png$|apple-touch-icon\\.png$|apple-icon\\.png$|icon-192\\.png$|icon-maskable\\.png$|manifest\\.webmanifest$|robots\\.txt$|sitemap\\.xml$|search-index\\.json$|rss\\.xml$|giscus\\.css$).*)",
  ],
};
