// Script elements in generated HTML. Tag and attribute names are case
// insensitive in HTML, so <SCRIPT> and <ScRiPt> are scripts too. This is a
// narrow check on our own build output, not an HTML parser.

/** Attribute text of every opening <script> tag. */
export function scriptOpenTags(html) {
  return [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1]);
}

/** Attribute text and body of every closed <script> element. */
export function scriptElements(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].map(
    (m) => ({ attributes: m[1], body: m[2] }),
  );
}

/** Whether the attributes mark a JSON-LD block, which the browser never executes. */
export function isJsonLd(attributes) {
  return /\btype\s*=\s*["']application\/ld\+json["']/i.test(attributes);
}
