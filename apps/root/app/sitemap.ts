import { isSearchPath } from "../../../seo/metadata";
import { pages, origin } from "../lib/seo";
export default function sitemap() {
  return pages
    .filter(({ path }) => !isSearchPath(path))
    .map(({ path }) => ({ url: new URL(path, origin).href }));
}
