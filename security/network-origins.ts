import { siteOrigins, type Site } from "./headers.ts";

// The authoritative list of origins the apps may contact from the browser.
// It is a regression guard, not an enforcement layer: the CSP in headers.ts
// enforces, this detects drift (see docs/network-origins.md). Own and sibling
// origins come from `siteOrigins`; the only third parties are listed below.

export const sites = Object.keys(siteOrigins) as Site[];

/** "page": requests made by the document. "frame": made inside a third-party frame the page embeds. */
type Via = "page" | "frame";

export interface Allowance {
  origin: string;
  via: Via;
  reason: string;
}

// Third-party origins per app, only in the state where they can be contacted.
// A new entry is an intentional, reviewed change: it needs a reason here, a
// matching CSP origin in headers.ts when `via` is "page", and an update to
// docs/network-origins.md.
export const thirdParties: Partial<
  Record<Site, { comments: readonly Allowance[] }>
> = {
  dump: {
    comments: [
      {
        origin: "https://giscus.app",
        via: "page",
        reason:
          "giscus client script, widget frame and discussion API, loaded when the comments section nears the viewport",
      },
      {
        origin: "https://github.githubassets.com",
        via: "frame",
        reason:
          "loading image requested by the giscus frame; the frame's own policy governs it, not the dump CSP",
      },
    ],
  },
};

/** "page" is every ordinary document; "comments" is a dump article after giscus has loaded. */
export type State = "page" | "comments";

export function siblingOrigins(site: Site) {
  return sites.filter((other) => other !== site).map((id) => siteOrigins[id]);
}

export function thirdPartyAllowances(site: Site, state: State = "page") {
  return state === "comments" ? (thirdParties[site]?.comments ?? []) : [];
}

export type Classification =
  | { kind: "own" | "sibling" | "third-party" | "internal"; origin: string }
  | { kind: "unexpected"; origin: string };

const INTERNAL_PROTOCOLS = new Set(["data:", "blob:", "about:"]);

/**
 * Classifies a request URL for `site`. `ownOrigins` adds the origins the app
 * is served from during a local run (the production origin is always own).
 */
export function classify(
  url: string,
  site: Site,
  state: State = "page",
  ownOrigins: readonly string[] = [],
): Classification {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "unexpected", origin: url };
  }
  if (INTERNAL_PROTOCOLS.has(parsed.protocol))
    return { kind: "internal", origin: parsed.protocol };
  // WebSocket origins are matched through their http(s) equivalent.
  const origin = parsed.origin.replace(/^ws(s?):/, "http$1:");
  if (origin === "null") return { kind: "unexpected", origin: url };
  if (origin === siteOrigins[site] || ownOrigins.includes(origin))
    return { kind: "own", origin };
  if (siblingOrigins(site).includes(origin)) return { kind: "sibling", origin };
  if (thirdPartyAllowances(site, state).some((item) => item.origin === origin))
    return { kind: "third-party", origin };
  return { kind: "unexpected", origin };
}

export interface Observation {
  app: Site;
  page: string;
  url: string;
  frame?: boolean;
}

/** One line per unexpected request, naming app, page, origin and URL. */
export function violations(
  observations: readonly Observation[],
  state: (observation: Observation) => State,
  ownOrigins: (site: Site) => readonly string[] = () => [],
) {
  return observations.flatMap((item) => {
    const result = classify(
      item.url,
      item.app,
      state(item),
      ownOrigins(item.app),
    );
    return result.kind === "unexpected"
      ? [
          `app ${item.app} page ${item.page}: unexpected origin ${result.origin} (${item.frame ? "inside a frame" : "document"}) ${item.url.slice(0, 120)}`,
        ]
      : [];
  });
}
