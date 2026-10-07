// Origin and host comparisons for the verification tooling. They parse the URL
// and compare whole origins or hosts, never substrings, so a lookalike such as
// https://giscus.app.example.com/ or https://evil.test/?next=https://giscus.app/
// does not match https://giscus.app.

/** The origin of a URL string, or undefined when it is not an absolute URL. */
export function originOf(value) {
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

/** Whether any URL or origin in `urls` has exactly the origin `origin`. */
export function includesOrigin(urls, origin) {
  const wanted = originOf(origin);
  return (
    wanted !== undefined && [...urls].some((url) => originOf(url) === wanted)
  );
}

/**
 * Whether a Content-Security-Policy lists `host` or one of its subdomains as a
 * source. Only host sources are considered; keywords such as 'self' are not.
 */
export function cspListsHost(csp, host) {
  for (const token of csp.split(/[;\s]+/)) {
    const source = token.replace("://*.", "://");
    let hostname;
    try {
      hostname = new URL(source).hostname;
    } catch {
      continue;
    }
    if (hostname === host || hostname.endsWith(`.${host}`)) return true;
  }
  return false;
}
