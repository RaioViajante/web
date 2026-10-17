import { isSearchPath } from "../../../seo/metadata";
import { allPages, origin } from "../lib/seo";
export default function sitemap() {
  return allPages
    .filter(({ path }) => !isSearchPath(path))
    .map(({ path }) => ({ url: new URL(path, origin).href }));
}
