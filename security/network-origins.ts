import { siteOrigins, type SiteId as Site } from "../site/sites.ts";

// The authoritative list of origins the apps may contact from the browser.
// It is a regression guard, not an enforcement layer: the CSP in headers.ts
// enforces, this detects drift (see docs/network-origins.md). Own and sibling
// origins come from `siteOrigins`; the only third parties are listed below.

export const sites = Object.keys(siteOrigins) as Site[];

type Via = "page";

export interface Allowance {
  origin: string;
  via: Via;
  reason: string;
}

// Third-party origins the page itself may contact, per app, only in the state
// where they can be contacted. A new entry is an intentional, reviewed change:
// it needs a reason here, a matching CSP origin in headers.ts, and an update to
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
          "giscus client script, widget frame and discussion API, loaded when the comments section nears the viewport or when returning from GitHub sign-in",
      },
    ],
  },
};

// Hosts an embedded frame may be served from. The frame's own requests (for
// example github.githubassets.com or avatars.githubusercontent.com, observed
// but not listed anywhere) are controlled by the frame's owner and can change
// without a change here, so they are reported, never enforced. Only the frame's
// host is: anything else loading in the frame is a failure.
export const frameHosts: Partial<Record<Site, readonly string[]>> = {
  dump: ["https://giscus.app"],
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
  /** The request was made inside an embedded frame, not by the document. */
  frame?: boolean;
  /** Origin of that frame's own document (its first request). */
  frameHost?: string;
}

export type Verdict =
  | { verdict: "ok"; kind: Classification["kind"]; origin: string }
  | { verdict: "report"; kind: "frame-internal"; origin: string }
  | { verdict: "fail"; origin: string; message: string };

/**
 * The origin policy for one request. The page's own requests must be own,
 * sibling or an approved third party. A frame must be served from an approved
 * frame host; what that frame then loads is reported, not enforced.
 */
export function judge(
  observation: Observation,
  state: State = "page",
  ownOrigins: readonly string[] = [],
): Verdict {
  const { app, page, url, frame, frameHost } = observation;
  const result = classify(url, app, state, ownOrigins);
  const where = `app ${app} page ${page}`;
  // data:, blob: and about: are never network requests, whichever context makes them.
  if (result.kind === "internal")
    return { verdict: "ok", kind: "internal", origin: result.origin };
  if (frame) {
    if (!frameHost || !(frameHosts[app] ?? []).includes(frameHost))
      return {
        verdict: "fail",
        origin: result.origin,
        message: `${where}: unexpected frame host ${frameHost ?? "(unknown)"} (request ${url.slice(0, 120)})`,
      };
    // The frame's own host is the approved frame; first-party requests are fine.
    if (result.origin === frameHost)
      return { verdict: "ok", kind: "third-party", origin: result.origin };
    if (result.kind === "own" || result.kind === "sibling")
      return { verdict: "ok", kind: result.kind, origin: result.origin };
    return { verdict: "report", kind: "frame-internal", origin: result.origin };
  }
  if (result.kind === "unexpected")
    return {
      verdict: "fail",
      origin: result.origin,
      message: `${where}: unexpected origin ${result.origin} (document) ${url.slice(0, 120)}`,
    };
  return { verdict: "ok", kind: result.kind, origin: result.origin };
}

/** Lines for every request that breaks the policy. */
export function violations(
  observations: readonly Observation[],
  state: (observation: Observation) => State,
  ownOrigins: (site: Site) => readonly string[] = () => [],
) {
  return observations.flatMap((item) => {
    const v = judge(item, state(item), ownOrigins(item.app));
    return v.verdict === "fail" ? [v.message] : [];
  });
}

/** Origins loaded inside approved frames: observed, with counts, never enforced. */
export function frameInternalOrigins(
  observations: readonly Observation[],
  state: (observation: Observation) => State,
  ownOrigins: (site: Site) => readonly string[] = () => [],
) {
  const seen = new Map<string, number>();
  for (const item of observations) {
    const v = judge(item, state(item), ownOrigins(item.app));
    if (v.verdict === "report")
      seen.set(v.origin, (seen.get(v.origin) ?? 0) + 1);
  }
  return seen;
}
