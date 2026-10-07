import { siteOrigins } from "../security/headers.ts";

// Pure helpers for the link and resource checker: extraction from HTML/CSS and
// classification of URLs. No I/O, so they are tested with fixtures.

const decode = (value) =>
  value.replace(
    /&(?:amp|lt|gt|quot|apos|#x27|#39);/g,
    (e) =>
      ({
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
        "&#x27;": "'",
        "&#39;": "'",
      })[e],
  );
const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? decode(m[1]) : undefined;
};
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((m) => m[0]);

/** Navigation links (`<a href>`), in document order. */
export function anchors(html) {
  return tags(html, "a").flatMap((tag) => {
    const href = attr(tag, "href");
    return href === undefined ? [] : [href];
  });
}

/** Resources a document loads: stylesheets, scripts, icons, manifest, preloads, images. */
export function resources(html) {
  const found = [];
  for (const tag of tags(html, "link")) {
    const rel = (attr(tag, "rel") ?? "").split(/\s+/);
    const href = attr(tag, "href");
    if (!href) continue;
    if (rel.includes("stylesheet"))
      found.push({ url: href, kind: "stylesheet" });
    else if (rel.includes("icon") || rel.includes("apple-touch-icon"))
      found.push({ url: href, kind: "icon" });
    else if (rel.includes("manifest"))
      found.push({ url: href, kind: "manifest" });
    else if (rel.includes("preload") || rel.includes("modulepreload")) {
      const as = attr(tag, "as");
      found.push({
        url: href,
        kind:
          as === "font"
            ? "font"
            : as === "script" || rel.includes("modulepreload")
              ? "script"
              : as === "style"
                ? "stylesheet"
                : as === "image"
                  ? "image"
                  : "other",
      });
    }
  }
  for (const tag of tags(html, "script")) {
    const src = attr(tag, "src");
    if (src) found.push({ url: src, kind: "script" });
  }
  for (const tag of tags(html, "img")) {
    const src = attr(tag, "src");
    if (src) found.push({ url: src, kind: "image" });
    for (const candidate of (attr(tag, "srcset") ?? "").split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) found.push({ url, kind: "image" });
    }
  }
  return found;
}

/** `url(...)` references in a stylesheet that are not data: URIs. */
export function cssUrls(css) {
  return [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)]
    .map((m) => m[2])
    .filter((u) => !u.startsWith("data:") && !u.startsWith("#"));
}

/** Every id and name a fragment can point at. */
export function fragmentTargets(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\s(?:id|name)="([^"]+)"/g))
    ids.add(decode(m[1]));
  return ids;
}

const appOf = (origin) =>
  Object.entries(siteOrigins).find(([, o]) => o === origin)?.[0];
const BAD_HOST =
  /(^|\.)localhost$|^127\.|^0\.0\.0\.0$|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|\.vercel\.app$|\.local$/i;

/**
 * Classifies an `href` found on a page of `fromApp` at `fromPath`.
 *  - { kind: "internal", app, path, hash } a RaioViajante URL, relative or absolute
 *  - { kind: "external", url } a valid public http(s) URL elsewhere
 *  - { kind: "mailto" }, { kind: "fragment", hash } same-page, { kind: "ignored" }
 *  - { kind: "bad", reason }
 */
export function classify(href, fromApp, fromPath) {
  if (href === "" || href === "#") return { kind: "ignored" };
  if (/^(javascript|data|blob):/i.test(href))
    return {
      kind: "bad",
      reason: `unsupported scheme in ${href.slice(0, 40)}`,
    };
  if (/^mailto:/i.test(href)) {
    const address = href.slice(7).split("?")[0];
    return /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(address)
      ? { kind: "mailto" }
      : { kind: "bad", reason: `malformed mailto ${href}` };
  }
  if (/^tel:/i.test(href)) return { kind: "ignored" };
  if (href.startsWith("#"))
    return { kind: "fragment", hash: decodeURIComponent(href.slice(1)) };
  let url;
  try {
    url = new URL(href, `${siteOrigins[fromApp]}${fromPath}`);
  } catch {
    return { kind: "bad", reason: `malformed URL ${href.slice(0, 60)}` };
  }
  if (!/^https?:$/.test(url.protocol))
    return { kind: "bad", reason: `unsupported scheme ${url.protocol}` };
  if (BAD_HOST.test(url.hostname))
    return {
      kind: "bad",
      reason: `local, private or preview host ${url.host}`,
    };
  const app = appOf(url.origin);
  if (app)
    return {
      kind: "internal",
      app,
      path: url.pathname + url.search,
      hash: url.hash ? decodeURIComponent(url.hash.slice(1)) : "",
    };
  if (url.protocol === "http:")
    return { kind: "bad", reason: `external link is not https: ${url.href}` };
  return { kind: "external", url: url.href };
}
