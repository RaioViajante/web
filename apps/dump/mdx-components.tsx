import type { MDXComponents } from "mdx/types";

/**
 * Global component overrides for MDX content.
 *
 * Kept deliberately empty: MDX elements render as plain semantic HTML and are
 * styled through `.prose` in `app/globals.css`. Add mappings here (or pass
 * per-page overrides) only when a real need appears.
 */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
